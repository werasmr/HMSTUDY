import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';
import { emitOrderUpdate } from '../lib/socket';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [
          { userId: req.user!.id },
          { order: { traderId: req.user!.id } },
        ],
      },
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

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

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

router.patch('/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const dispute = await prisma.dispute.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

export default router;
