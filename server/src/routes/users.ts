import { Router } from 'express';
import { z } from 'zod';
import { hashPassword } from '../lib/passwords.js';
import { prisma } from '../lib/prisma.js';
import { formatIssues, passwordRule } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Every route in this file is for logged-in admins only
router.use(requireAuth, requireRole('ADMIN'));

// Never send passwordHash to the browser
const publicFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: passwordRule,
});

const statusSchema = z.object({ isActive: z.boolean() });

// GET /api/users: list everyone
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({ select: publicFields, orderBy: { id: 'asc' } });
  res.status(200).json(users);
});

// POST /api/users: create a staff account
router.post('/', async (req, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation failed', errors: formatIssues(result.error) });
    return;
  }
  const { name, email, password } = result.data;

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: 'STAFF' },
      select: publicFields,
    });
    res.status(201).json(user);
  } catch (error) {
    if (typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002') {
      res.status(409).json({ message: 'A user with this email already exists' });
      return;
    }
    throw error;
  }
});

// PATCH /api/users/:id: activate or deactivate an account
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid user id' });
    return;
  }

  const result = statusSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation failed', errors: formatIssues(result.error) });
    return;
  }

  if (id === req.user?.id) {
    res.status(400).json({ message: 'You cannot change your own account status' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: result.data.isActive },
    select: publicFields,
  });
  res.status(200).json(user);
});

export default router;