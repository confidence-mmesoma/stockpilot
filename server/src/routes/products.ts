import { Router, type Request } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { formatIssues } from '../lib/validation.js';

const router = Router();

// Everything below requires a logged-in user
router.use(requireAuth);

// Rules for valid product data
const fields = {
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  sku: z.string().trim().min(1, 'SKU is required').max(30, 'SKU must be 30 characters or less'),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int('Threshold must be a whole number').min(0, 'Threshold cannot be negative'),
};

const createSchema = z.object({
  ...fields,
  lowStockThreshold: fields.lowStockThreshold.optional(),
});
const updateSchema = z.object(fields).partial();

// function formatIssues(error: z.ZodError) {
//   return error.issues.map((issue) => ({
//     field: issue.path.join('.'),
//     message: issue.message,
//   }));
// }

function parseId(req: Request) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// The database stores price as an exact decimal; the API returns a plain number
function toResponse<T extends { price: unknown }>(product: T) {
  return { ...product, price: Number(product.price) };
}

// P2002 is Prisma's code for "this value must be unique but already exists"
function isUniqueViolation(error: unknown) {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
}

// GET /api/products: list all active products
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    orderBy: { id: 'asc' },
  });
  res.status(200).json(products.map(toResponse));
});

// GET /api/products/:id: get one product
router.get('/:id', async (req, res) => {
  const id = parseId(req);
  if (!id) {
    res.status(400).json({ message: 'Invalid product id' });
    return;
  }

  const product = await prisma.product.findFirst({ where: { id, isArchived: false } });
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.status(200).json(toResponse(product));
});

// POST /api/products: create a product
router.post('/', requireRole('ADMIN'), async (req, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation failed', errors: formatIssues(result.error) });
    return;
  }

  const data = result.data;
  const sku = data.sku.toUpperCase();

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku,
        price: data.price,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold ?? 5,
      },
    });
    res.status(201).json(toResponse(product));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ message: `A product with SKU "${sku}" already exists` });
      return;
    }
    throw error;
  }
});

// PUT /api/products/:id: update one or more fields of a product
router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  const id = parseId(req);
  if (!id) {
    res.status(400).json({ message: 'Invalid product id' });
    return;
  }

  const existing = await prisma.product.findFirst({ where: { id, isArchived: false } });
  if (!existing) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation failed', errors: formatIssues(result.error) });
    return;
  }

  const updates = result.data;
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ message: 'Provide at least one field to update' });
    return;
  }

  if (updates.sku) {
    updates.sku = updates.sku.toUpperCase();
  }

  try {
    const product = await prisma.product.update({ where: { id }, data: updates });
    res.status(200).json(toResponse(product));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ message: `A product with SKU "${updates.sku}" already exists` });
      return;
    }
    throw error;
  }
});

// DELETE /api/products/:id: archive a product (it is not permanently removed)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  const id = parseId(req);
  if (!id) {
    res.status(400).json({ message: 'Invalid product id' });
    return;
  }

  const existing = await prisma.product.findFirst({ where: { id, isArchived: false } });
  if (!existing) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  const product = await prisma.product.update({ where: { id }, data: { isArchived: true } });
  res.status(200).json({ message: 'Product archived', product: toResponse(product) });
});

export default router;