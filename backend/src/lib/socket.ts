import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { getAllowedOrigins } from './cors';
import { canAccessOrder } from '../middleware/auth';
import { Role } from '@prisma/client';

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || !user.isActive) return next(new Error('User not found'));
      socket.data.userId = user.id;
      socket.data.role = user.role as Role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    const role = socket.data.role as Role;
    socket.join(`user:${userId}`);

    socket.on('join_order', async (orderId: string) => {
      const allowed = await canAccessOrder(userId, role, orderId);
      if (!allowed) return;
      socket.join(`order:${orderId}`);
    });

    socket.on('leave_order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('send_message', async (data: { orderId: string; text: string; fileUrl?: string }) => {
      const allowed = await canAccessOrder(userId, role, data.orderId);
      if (!allowed || !data.text?.trim()) return;

      const message = await prisma.message.create({
        data: {
          orderId: data.orderId,
          senderId: userId,
          text: data.text.trim(),
          fileUrl: data.fileUrl,
        },
        include: { sender: { select: { id: true, email: true, role: true } } },
      });
      io.to(`order:${data.orderId}`).emit('new_message', message);
    });

    socket.on('disconnect', async () => {
      if (role === 'TRADER') {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false },
        }).catch(() => {});
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitOrderUpdate(orderId: string, data: unknown) {
  if (io) {
    io.to(`order:${orderId}`).emit('order_update', data);
  }
}

export function emitToUser(userId: string, event: string, data: unknown) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
