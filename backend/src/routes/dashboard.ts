import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { getRateToUsdt } from '../services/currency';

const router = Router();

router.use(authenticate);

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 86400000);
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const whereBase = req.user!.role === 'TRADER'
      ? { traderId: userId }
      : req.user!.role === 'MERCHANT'
        ? { merchantId: userId }
        : {};

    const [dayOrders, weekOrders, monthOrders, activeRequisites, confirmedOrders, totalOrders, rubRate] = await Promise.all([
      prisma.order.aggregate({ where: { ...whereBase, status: 'CONFIRMED', createdAt: { gte: dayAgo } }, _sum: { amount: true }, _count: true }),
      prisma.order.aggregate({ where: { ...whereBase, status: 'CONFIRMED', createdAt: { gte: weekAgo } }, _sum: { amount: true }, _count: true }),
      prisma.order.aggregate({ where: { ...whereBase, status: 'CONFIRMED', createdAt: { gte: monthAgo } }, _sum: { amount: true }, _count: true }),
      req.user!.role === 'TRADER'
        ? prisma.requisite.count({ where: { traderId: userId, isActive: true, isArchived: false } })
        : Promise.resolve(0),
      prisma.order.count({ where: { ...whereBase, status: 'CONFIRMED' } }),
      prisma.order.count({ where: whereBase }),
      getRateToUsdt('RUB').catch(() => 81.3),
    ]);

    res.json({
      turnover: { day: dayOrders._sum.amount || 0, week: weekOrders._sum.amount || 0, month: monthOrders._sum.amount || 0 },
      deals: { day: dayOrders._count, week: weekOrders._count, month: monthOrders._count },
      activeRequisites,
      conversion: totalOrders > 0 ? Math.round((confirmedOrders / totalOrders) * 100) : 0,
      usdtRate: rubRate,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
