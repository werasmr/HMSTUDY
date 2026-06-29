import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    isActive: boolean;
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: Role;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

export async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const merchant = await prisma.user.findUnique({ where: { apiKey } });
  if (!merchant || merchant.role !== 'MERCHANT' || !merchant.isActive) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  (req as AuthRequest).user = {
    id: merchant.id,
    email: merchant.email,
    role: merchant.role,
    isActive: merchant.isActive,
  };
  next();
}

export async function canAccessOrder(userId: string, role: Role, orderId: string): Promise<boolean> {
  if (role === 'ADMIN') return true;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { traderId: true, merchantId: true },
  });
  if (!order) return false;

  if (role === 'TRADER' && order.traderId === userId) return true;
  if (role === 'MERCHANT' && order.merchantId === userId) return true;
  return false;
}
