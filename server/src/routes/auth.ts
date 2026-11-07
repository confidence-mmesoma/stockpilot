import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { COOKIE_NAME, cookieOptions, signToken } from '../lib/auth.js';
import { hashPassword, verifyPassword } from '../lib/passwords.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { formatIssues, passwordRule } from '../lib/validation.js';

const router = Router();

const setupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: passwordRule,
  setupKey: z.string().min(1, 'Setup key is required'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

function keysMatch(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function toPublicUser(user: { id: number; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// Used when the email does not exist, so the response takes the same time either way
const DUMMY_HASH = await hashPassword('not-a-real-password');

// POST /api/auth/setup: create the very first admin (needs the SETUP_KEY, works only once)
router.post('/setup', async (req, res) => {
  const expectedKey = process.env.SETUP_KEY;
  if (!expectedKey) {
    res.status(503).json({ message: 'Setup is not enabled on this server' });
    return;
  }

  const result = setupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation failed', errors: formatIssues(result.error) });
    return;
  }
  const { name, email, password, setupKey } = result.data;

  if (!keysMatch(setupKey, expectedKey)) {
    res.status(403).json({ message: 'Invalid setup key' });
    return;
  }

  if ((await prisma.user.count()) > 0) {
    res.status(403).json({ message: 'Setup has already been completed' });
    return;
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role: 'ADMIN' },
  });
  res.status(201).json(toPublicUser(user));
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation failed', errors: formatIssues(result.error) });
    return;
  }
  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  // Same message for every failure, so attackers cannot tell which emails exist
  if (!user || !user.isActive || !valid) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
  res.status(200).json(toPublicUser(user));
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(200).json({ message: 'Logged out' });
});

// GET /api/auth/me: who is logged in right now?
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json(req.user);
});

export default router;