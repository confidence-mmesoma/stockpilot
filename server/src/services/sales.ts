import { prisma } from '../lib/prisma.js';

export class SaleError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type SaleItemInput = { productId: number; quantity: number };

// Records how each product's stock changed. We will use this for low-stock alerts.
export type StockChange = {
  productId: number;
  name: string;
  before: number;
  after: number;
  lowStockThreshold: number;
};

export const saleInclude = {
  items: { include: { product: { select: { name: true, sku: true } } } },
  user: { select: { id: true, name: true } },
} as const;

// Work in kobo (whole numbers) so money maths never has rounding errors
const toKobo = (amount: { toString(): string }) => Math.round(Number(amount.toString()) * 100);

  function getStockAlert(change: StockChange) {
    if (change.after === 0 && change.before > 0) {
      return { type: 'OUT_OF_STOCK' as const, message: `${change.name} is out of stock` };
    }
    if (change.before > change.lowStockThreshold && change.after <= change.lowStockThreshold) {
      return {
        type: 'LOW_STOCK' as const,
        message: `${change.name} is running low: ${change.after} left (alert level ${change.lowStockThreshold})`,
      };
    }
    return null;
  }

export async function createSale(userId: number, items: SaleItemInput[]) {
  // Always handle products in the same order, so two sales at once cannot deadlock
  const sorted = [...items].sort((a, b) => a.productId - b.productId);

  return prisma.$transaction(async (tx) => {
    const stockChanges: StockChange[] = [];
    const lines: { productId: number; quantity: number; unitPrice: number }[] = [];
    let totalKobo = 0;

    for (const item of sorted) {
      // Reduce stock only if enough remains. The check and the update are one step.
      const updated = await tx.product.updateMany({
        where: { id: item.productId, isArchived: false, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      const product = await tx.product.findFirst({
        where: { id: item.productId, isArchived: false },
      });

      if (!product) {
        throw new SaleError(`Product ${item.productId} was not found`, 404);
      }
      if (updated.count === 0) {
        throw new SaleError(
          `Not enough stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
          409,
        );
      }

      stockChanges.push({
        productId: product.id,
        name: product.name,
        before: product.stock + item.quantity,
        after: product.stock,
        lowStockThreshold: product.lowStockThreshold,
      });

      const unitKobo = toKobo(product.price);
      lines.push({ productId: product.id, quantity: item.quantity, unitPrice: unitKobo / 100 });
      totalKobo += unitKobo * item.quantity;
    }

    const sale = await tx.sale.create({
      data: { userId, total: totalKobo / 100, items: { create: lines } },
      include: saleInclude,
    });

          // Save an alert only when stock drops through the threshold (or hits zero)
      const alerts = stockChanges.flatMap((change) => {
        const alert = getStockAlert(change);
        return alert ? [{ ...alert, productId: change.productId }] : [];
      });
      const notifications = await Promise.all(
        alerts.map((alert) => tx.notification.create({ data: alert })),
      );

    return { sale, stockChanges, notifications };
  });
}

// The database stores money as exact decimals; the API returns plain numbers
export function toSaleResponse<I extends { unitPrice: unknown }, T extends { total: unknown; items: I[] }>(
  sale: T,
) {
  return {
    ...sale,
    total: Number(sale.total),
    items: sale.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice) })),
  };
}