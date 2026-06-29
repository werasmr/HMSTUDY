import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import {
  findMatchingRequisite,
  freezeTraderBalance,
  getRequisiteType,
  getRequisiteNumber,
  sendWebhook,
  confirmOrder,
  expireOrder,
} from '../services/matching';
import { emitOrderUpdate, emitToUser } from '../lib/socket';

const traderRouter = Router();
traderRouter.use(authenticate);
traderRouter.use(requireRole('TRADER', 'ADMIN', 'MERCHANT'));

traderRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, search, page = '1', limit = '20', minAmount, maxAmount, dateFrom, dateTo } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (req.user!.role === 'TRADER') {
      where.traderId = req.user!.id;
    } else if (req.user!.role === 'MERCHANT') {
      where.merchantId = req.user!.id;
    }

    if (type) where.type = type;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { id: { contains: search as string } },
        { merchantOrderId: { contains: search as string } },
      ];
    }

    if (minAmount) where.amount = { ...(where.amount as object || {}), gte: parseFloat(minAmount as string) };
    if (maxAmount) where.amount = { ...(where.amount as object || {}), lte: parseFloat(maxAmount as string) };
    if (dateFrom) where.createdAt = { ...(where.createdAt as object || {}), gte: new Date(dateFrom as string) };
    if (dateTo) where.createdAt = { ...(where.createdAt as object || {}), lte: new Date(dateTo as string) };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          requisite: { include: { device: true } },
          trader: { select: { id: true, email: true } },
          merchant: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

traderRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        ...(req.user!.role === 'TRADER' ? { traderId: req.user!.id } : {}),
        ...(req.user!.role === 'MERCHANT' ? { merchantId: req.user!.id } : {}),
      },
      include: {
        requisite: { include: { device: true } },
        messages: {
          include: { sender: { select: { id: true, email: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        disputes: true,
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

traderRouter.post('/:id/confirm', async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, traderId: req.user!.id },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!['WAITING_PAYMENT', 'PAID'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot confirm this order' });
    }

    await confirmOrder(order.id);
    const updated = await prisma.order.findUnique({ where: { id: order.id } });
    emitOrderUpdate(order.id, updated);
    await sendWebhook(order.id);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

traderRouter.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, traderId: req.user!.id },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await expireOrder(order.id);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    const updated = await prisma.order.findUnique({ where: { id: order.id } });
    emitOrderUpdate(order.id, updated);
    await sendWebhook(order.id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

traderRouter.post('/:id/paid', async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' },
    });
    emitOrderUpdate(order.id, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default traderRouter;
