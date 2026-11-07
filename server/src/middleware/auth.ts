import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../generated/prisma/client.js';
import { COOKIE_NAME, verifyToken } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

// Blocks anyone who is not logged in
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const userId = token ? verifyToken(token) : null;
  if (!userId) {
    res.status(401).json({ message: 'Please log in to continue' });
    return;
  }

  // Check the database every time, so a deactivated user loses access immediately
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) {
    res.status(401).json({ message: 'Please log in to continue' });
    return;
  }

  req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  next();
}

// Blocks logged-in users who do not have one of the allowed roles
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'You do not have permission to do this' });
      return;
    }
    next();
  };
}