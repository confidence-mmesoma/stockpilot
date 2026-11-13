import type { Server as HttpServer } from 'node:http';
import { parseCookie } from 'cookie';
import { Server } from 'socket.io';
import { COOKIE_NAME, verifyToken } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true },
  });

  // Every connection must carry a valid login cookie, or it is refused
  io.use(async (socket, next) => {
    try {
      const token = parseCookie(socket.request.headers.cookie ?? '')[COOKIE_NAME];
      const userId = token ? verifyToken(token) : null;
      if (!userId) return next(new Error('Unauthorized'));

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isActive: true },
      });
      if (!user || !user.isActive) return next(new Error('Unauthorized'));

      socket.data.userId = user.id;
      socket.data.role = user.role;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // A private room per user, and a shared room for admins
    socket.join(`user:${socket.data.userId}`);
    if (socket.data.role === 'ADMIN') {
      socket.join('admins');
    }
  });
}

// Only admins receive these
export function emitToAdmins(event: string, payload: unknown) {
  io?.to('admins').emit(event, payload);
}

// Every connected user is already logged in, because unauthenticated connections are refused
export function emitToAll(event: string, payload: unknown) {
  io?.emit(event, payload);
}