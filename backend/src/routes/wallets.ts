import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/my', requireRole('TRADER'), async (req: AuthRequest, res: Response) => {
  const wallets = await prisma.wallet.findMany({
    where: { traderId: req.user!.id, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(wallets);
});

export default router;
