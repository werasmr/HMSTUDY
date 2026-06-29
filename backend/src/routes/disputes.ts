import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole, canAccessOrder } from '../middleware/auth';
import { emitOrderUpdate } from '../lib/socket';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const where = req.user!.role === 'ADMIN'
      ? {}
      : {
          OR: [
            { userId: req.user!.id },
            { order: { traderId: req.user!.id } },
          ],
        };

    const disputes = await prisma.dispute.findMany({
      where,
      include: {
        order: {
          include: {
            requisite: true,
            messages: {
              include: { sender: { select: { id: true, email: true, role: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId || !reason) {
      return res.status(400).json({ error: 'orderId and reason required' });
    }

    const allowed = await canAccessOrder(req.user!.id, req.user!.role, orderId);
    if (!allowed) return res.status(404).json({ error: 'Order not found' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || !['WAITING_PAYMENT', 'PAID', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot dispute this order' });
    }

    const existing = await prisma.dispute.findFirst({
      where: { orderId, status: 'OPEN' },
    });
    if (existing) return res.status(400).json({ error: 'Dispute already open' });

    const dispute = await prisma.dispute.create({
      data: { orderId, userId: req.user!.id, reason },
      include: { order: true },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DISPUTED' },
    });

    emitOrderUpdate(orderId, { status: 'DISPUTED' });
    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

router.patch('/:id/resolve', requireRole('ADMIN', 'TRADER'), async (req: AuthRequest, res: Response) => {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: req.params.id },
      include: { order: true },
    });
    if (!dispute) return res.status(404).json({ error: 'Not found' });

    if (req.user!.role === 'TRADER' && dispute.order.traderId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.dispute.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

export default router;
