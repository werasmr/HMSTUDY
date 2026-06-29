import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('TRADER', 'ADMIN'));

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { archived, search } = req.query;
    const where: Record<string, unknown> = {
      traderId: req.user!.id,
      isArchived: archived === 'true',
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { ownerName: { contains: search as string, mode: 'insensitive' } },
        { cardNumber: { contains: search as string } },
        { phone: { contains: search as string } },
      ];
    }

    const requisites = await prisma.requisite.findMany({
      where,
      include: { device: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requisites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requisites' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const requisite = await prisma.requisite.create({
      data: {
        traderId: req.user!.id,
        name: data.name,
        ownerName: data.ownerName,
        bank: data.bank,
        currency: data.currency || 'RUB',
        cardNumber: data.cardNumber,
        accountNumber: data.accountNumber,
        phone: data.phone,
        acceptCard: data.acceptCard ?? true,
        acceptAccount: data.acceptAccount ?? false,
        acceptSbp: data.acceptSbp ?? false,
        dailyLimit: parseFloat(data.dailyLimit) || 0,
        totalLimit: parseFloat(data.totalLimit) || 0,
        minOrder: parseFloat(data.minOrder) || 100,
        maxOrder: parseFloat(data.maxOrder) || 100000,
        maxPaymentsPerDay: parseInt(data.maxPaymentsPerDay) || 10,
        maxParallelDeals: parseInt(data.maxParallelDeals) || 3,
        delayBetweenOrders: parseInt(data.delayBetweenOrders) || 0,
        deviceId: data.deviceId || null,
        useUniqueAmounts: data.useUniqueAmounts ?? false,
      },
      include: { device: true },
    });
    res.status(201).json(requisite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create requisite' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.requisite.findFirst({
      where: { id: req.params.id, traderId: req.user!.id },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const requisite = await prisma.requisite.update({
      where: { id: req.params.id },
      data: req.body,
      include: { device: true },
    });
    res.json(requisite);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update requisite' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.requisite.findFirst({
      where: { id: req.params.id, traderId: req.user!.id },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.requisite.update({
      where: { id: req.params.id },
      data: { isArchived: true, isActive: false },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete requisite' });
  }
});

export default router;
