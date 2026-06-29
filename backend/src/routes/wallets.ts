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

router.get('/deposits', requireRole('TRADER'), async (req: AuthRequest, res: Response) => {
  const deposits = await prisma.walletDeposit.findMany({
    where: { traderId: req.user!.id },
    include: { wallet: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(deposits);
});

router.post('/deposits', requireRole('TRADER'), async (req: AuthRequest, res: Response) => {
  const { walletId, amount, txHash, currencyCode = 'USDT' } = req.body;
  if (!walletId || !amount) {
    return res.status(400).json({ error: 'walletId and amount required' });
  }

  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, traderId: req.user!.id, isActive: true },
  });
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  const deposit = await prisma.walletDeposit.create({
    data: {
      walletId,
      traderId: req.user!.id,
      amount: parseFloat(amount),
      currencyCode: currencyCode || wallet.currencyCode,
      txHash,
    },
    include: { wallet: true },
  });
  res.status(201).json(deposit);
});

export default router;
