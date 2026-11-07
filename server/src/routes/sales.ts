import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { formatIssues } from '../lib/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { createSale, saleInclude, SaleError, toSaleResponse } from '../services/sales.js';

const router = Router();

// Admins and staff can both record and view sales
router.use(requireAuth);

const saleSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.number().int('Product id must be a whole number').positive('Product id must be positive'),
          quantity: z
            .number()
            .int('Quantity must be a whole number')
            .min(1, 'Quantity must be at least 1')
            .max(10000, 'Quantity is too large'),
        }),
      )
      .min(1, 'Add at least one item')
      .max(50, 'A sale can have at most 50 different items'),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<number>();
    for (const item of data.items) {
      if (seen.has(item.productId)) {
        ctx.addIssue({ code: 'custom', message: 'Each product can only appear once', path: ['items'] });
        return;
      }
      seen.add(item.productId);
    }
  });

// GET /api/sales: admins see every sale, staff see only their own
router.get('/', async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: 'Please log in to continue' });
    return;
  }

  const where = user.role === 'ADMIN' ? {} : { userId: user.id };
  const sales = await prisma.sale.findMany({
    where,
    include: saleInclude,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.status(200).json(sales.map(toSaleResponse));
});

// POST /api/sales: record a sale and reduce stock
router.post('/', async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: 'Please log in to continue' });
    return;
  }

  const result = saleSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation failed', errors: formatIssues(result.error) });
    return;
  }

  try {
    const { sale } = await createSale(user.id, result.data.items);
    res.status(201).json(toSaleResponse(sale));
  } catch (error) {
    if (error instanceof SaleError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    throw error;
  }
});

export default router;