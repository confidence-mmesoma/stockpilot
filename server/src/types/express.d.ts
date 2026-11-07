import type { Role } from '../generated/prisma/client.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; name: string; email: string; role: Role };
    }
  }
}

export {};