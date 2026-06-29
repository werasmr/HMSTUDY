import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { pickRequisiteFields, parseNumber, parseIntSafe } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('TRADER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { archived, search } = req.query;
    const isAdmin = req.user!.role === 'ADMIN';

    const where: Record<string, unknown> = {
      isArchived: archived === 'true',
    };

    if (!isAdmin) {
      where.traderId = req.user!.id;
    }

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
      include: { device: true, trader: isAdmin ? { select: { id: true, email: true } } : false },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requisites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requisites' });
  }
});

router.post('/', requireRole('TRADER'), async (req: AuthRequest, res: Response) => {
  try {
    const data = pickRequisiteFields(req.body);
    const requisite = await prisma.requisite.create({
      data: {
        traderId: req.user!.id,
        name: data.name as string,
        ownerName: data.ownerName as string,
        bank: data.bank as string,
        currency: (data.currency as 'RUB' | 'USDT') || 'RUB',
        cardNumber: data.cardNumber as string | undefined,
        accountNumber: data.accountNumber as string | undefined,
        phone: data.phone as string | undefined,
        acceptCard: Boolean(data.acceptCard ?? true),
        acceptAccount: Boolean(data.acceptAccount ?? false),
        acceptSbp: Boolean(data.acceptSbp ?? false),
        dailyLimit: parseNumber(data.dailyLimit, 0),
        totalLimit: parseNumber(data.totalLimit, 0),
        minOrder: parseNumber(data.minOrder, 100),
        maxOrder: parseNumber(data.maxOrder, 100000),
        maxPaymentsPerDay: parseIntSafe(data.maxPaymentsPerDay, 10),
        maxParallelDeals: parseIntSafe(data.maxParallelDeals, 3),
        delayBetweenOrders: parseIntSafe(data.delayBetweenOrders, 0),
        deviceId: (data.deviceId as string) || null,
        useUniqueAmounts: Boolean(data.useUniqueAmounts),
      },
      include: { device: true },
    });
    res.status(201).json(requisite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create requisite' });
  }
});

router.patch('/:id', requireRole('TRADER'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.requisite.findFirst({
      where: { id: req.params.id, traderId: req.user!.id },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const data = pickRequisiteFields(req.body);
    const requisite = await prisma.requisite.update({
      where: { id: req.params.id },
      data,
      include: { device: true },
    });
    res.json(requisite);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update requisite' });
  }
});

router.delete('/:id', requireRole('TRADER'), async (req: AuthRequest, res: Response) => {
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
