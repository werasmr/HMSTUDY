import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { getUsdtRate } from '../utils/format';

const router = Router();

router.use(authenticate);

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const whereBase = req.user!.role === 'TRADER'
      ? { traderId: userId }
      : req.user!.role === 'MERCHANT'
        ? { merchantId: userId }
        : {};

    const [dayOrders, weekOrders, monthOrders, activeRequisites, confirmedOrders, totalOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { ...whereBase, status: 'CONFIRMED', createdAt: { gte: dayAgo } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { ...whereBase, status: 'CONFIRMED', createdAt: { gte: weekAgo } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { ...whereBase, status: 'CONFIRMED', createdAt: { gte: monthAgo } },
        _sum: { amount: true },
        _count: true,
      }),
      req.user!.role === 'TRADER'
        ? prisma.requisite.count({ where: { traderId: userId, isActive: true, isArchived: false } })
        : Promise.resolve(0),
      prisma.order.count({ where: { ...whereBase, status: 'CONFIRMED' } }),
      prisma.order.count({ where: whereBase }),
    ]);

    const conversion = totalOrders > 0 ? Math.round((confirmedOrders / totalOrders) * 100) : 0;

    res.json({
      turnover: {
        day: dayOrders._sum.amount || 0,
        week: weekOrders._sum.amount || 0,
        month: monthOrders._sum.amount || 0,
      },
      deals: {
        day: dayOrders._count,
        week: weekOrders._count,
        month: monthOrders._count,
      },
      activeRequisites,
      conversion,
      usdtRate: getUsdtRate(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/users', authenticate, requireRole('ADMIN'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        frozenBalance: true,
        isOnline: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
