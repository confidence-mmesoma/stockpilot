import { useState } from "react";
import { formatNaira } from "../lib/format";
import type { Product, SaleLine } from "../types";
import { Button } from "./Button";

type Props = {
  products: Product[];
  onSubmit: (items: SaleLine[]) => Promise<void>;
};

export function SaleForm({ products, onSubmit }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState<SaleLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const available = products.filter((product) => product.stock > 0);
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines = cart.map((line) => {
    const product = byId.get(line.productId);
    return {
      ...line,
      name: product?.name ?? "Unknown product",
      price: product?.price ?? 0,
    };
  });

  // Work in kobo (whole numbers) so adding up money never gives rounding errors
  const totalKobo = lines.reduce(
    (sum, line) => sum + Math.round(line.price * 100) * line.quantity,
    0,
  );

  function handleAdd() {
    setError(null);
    const product = byId.get(Number(selectedId));
    const qty = Number(quantity);

    if (!product) {
      setError("Choose a product");
      return;
    }
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Quantity must be a whole number, 1 or more");
      return;
    }

    const inCart =
      cart.find((line) => line.productId === product.id)?.quantity ?? 0;
    if (inCart + qty > product.stock) {
      setError(`Only ${product.stock} of "${product.name}" in stock`);
      return;
    }

    setCart((current) =>
      inCart > 0
        ? current.map((line) =>
            line.productId === product.id
              ? { ...line, quantity: line.quantity + qty }
              : line,
          )
        : [...current, { productId: product.id, quantity: qty }],
    );
    setSelectedId("");
    setQuantity("1");
  }

  function handleRemove(productId: number) {
    setCart((current) =>
      current.filter((line) => line.productId !== productId),
    );
  }

  async function handleSubmit() {
    if (cart.length === 0) {
      setError("Add at least one item");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(cart);
      setCart([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
        <div>
          <label
            htmlFor="product"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Product
          </label>
          <select
            id="product"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Choose a product...</option>
            {available.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.stock} in stock)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="quantity"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Quantity
          </label>
          <input
            id="quantity"
            value={quantity}
            inputMode="numeric"
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {lines.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Total</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line) => (
              <tr key={line.productId}>
                <td className="py-2 text-slate-800">{line.name}</td>
                <td className="py-2 text-right">{line.quantity}</td>
                <td className="py-2 text-right">{formatNaira(line.price)}</td>
                <td className="py-2 text-right">
                  {formatNaira(
                    (Math.round(line.price * 100) * line.quantity) / 100,
                  )}
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(line.productId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && (
        <p
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-lg font-semibold text-slate-800">
          Total: {formatNaira(totalKobo / 100)}
        </p>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || cart.length === 0}
        >
          {submitting ? "Recording..." : "Record sale"}
        </Button>
      </div>
    </div>
  );
}
