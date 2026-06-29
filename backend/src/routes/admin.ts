import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { adminAdjustBalanceTx, approveWalletDepositTx } from '../services/ledger';
import { pickRequisiteFields, parseNumber, parseIntSafe } from '../utils/validation';
import { upsertCurrency, upsertCommissionRate, getAllCurrencies } from '../services/currency';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

// --- Users ---
router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      balance: true,
      frozenBalance: true,
      insuranceDeposit: true,
      isOnline: true,
      isActive: true,
      apiKey: true,
      createdAt: true,
      _count: { select: { wallets: true, requisites: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.post('/users', async (req: AuthRequest, res: Response) => {
  const { email, password, role, balance, insuranceDeposit } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (!['TRADER', 'MERCHANT'].includes(role)) {
    return res.status(400).json({ error: 'Role must be TRADER or MERCHANT' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email exists' });

  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      role,
      apiKey: role === 'MERCHANT' ? uuidv4() : undefined,
      balance: parseNumber(balance, 0),
      insuranceDeposit: parseNumber(insuranceDeposit, role === 'TRADER' ? 100 : 0),
    },
    select: {
      id: true, email: true, role: true, balance: true,
      insuranceDeposit: true, apiKey: true, isActive: true,
    },
  });
  res.status(201).json(user);
});

router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
  const { isActive, role, insuranceDeposit, isOnline } = req.body;
  const data: Record<string, unknown> = {};
  if (isActive !== undefined) data.isActive = Boolean(isActive);
  if (role !== undefined && ['TRADER', 'MERCHANT'].includes(role)) data.role = role;
  if (insuranceDeposit !== undefined) data.insuranceDeposit = parseNumber(insuranceDeposit, 0);
  if (isOnline !== undefined) data.isOnline = Boolean(isOnline);

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: {
      id: true, email: true, role: true, balance: true,
      frozenBalance: true, insuranceDeposit: true, isActive: true, isOnline: true,
    },
  });
  res.json(user);
});

router.post('/users/:id/balance', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, type } = req.body;
    if (!['DEPOSIT', 'WITHDRAWAL'].includes(type)) {
      return res.status(400).json({ error: 'Type must be DEPOSIT or WITHDRAWAL' });
    }

    const user = await prisma.$transaction((tx) =>
      adminAdjustBalanceTx(tx, req.params.id, parseNumber(amount, 0), type, req.user!.id)
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Balance adjustment failed' });
  }
});

// --- Wallets (admin assigns to traders) ---
router.get('/wallets', async (req, res) => {
  const { traderId } = req.query;
  const wallets = await prisma.wallet.findMany({
    where: traderId ? { traderId: traderId as string } : undefined,
    include: {
      trader: { select: { id: true, email: true } },
      assigner: { select: { id: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(wallets);
});

router.post('/wallets', async (req: AuthRequest, res: Response) => {
  const { traderId, address, network = 'TRC20', label, currencyCode = 'USDT' } = req.body;
  if (!traderId || !address) {
    return res.status(400).json({ error: 'traderId and address required' });
  }

  const trader = await prisma.user.findFirst({
    where: { id: traderId, role: 'TRADER' },
  });
  if (!trader) return res.status(404).json({ error: 'Trader not found' });

  const wallet = await prisma.wallet.create({
    data: {
      traderId,
      assignedBy: req.user!.id,
      address: String(address).trim(),
      network,
      label,
      currencyCode,
    },
    include: { trader: { select: { id: true, email: true } } },
  });
  res.status(201).json(wallet);
});

router.patch('/wallets/:id', async (req, res) => {
  const { isActive, label, network } = req.body;
  const data: Record<string, unknown> = {};
  if (isActive !== undefined) data.isActive = Boolean(isActive);
  if (label !== undefined) data.label = label;
  if (network !== undefined) data.network = network;

  const wallet = await prisma.wallet.update({
    where: { id: req.params.id },
    data,
  });
  res.json(wallet);
});

router.delete('/wallets/:id', async (req, res) => {
  await prisma.wallet.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Requisites (admin manages all) ---
router.get('/requisites', async (_req, res) => {
  const requisites = await prisma.requisite.findMany({
    include: {
      trader: { select: { id: true, email: true } },
      device: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requisites);
});

router.post('/requisites', async (req, res) => {
  const data = pickRequisiteFields(req.body, true);
  if (!data.traderId || !data.name || !data.ownerName || !data.bank) {
    return res.status(400).json({ error: 'traderId, name, ownerName, bank required' });
  }

  const requisite = await prisma.requisite.create({
    data: {
      traderId: data.traderId as string,
      name: data.name as string,
      ownerName: data.ownerName as string,
      bank: data.bank as string,
      currencyCode: (data.currencyCode as string) || (data.currency as string) || 'RUB',
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
    include: { trader: { select: { id: true, email: true } }, device: true },
  });
  res.status(201).json(requisite);
});

router.patch('/requisites/:id', async (req, res) => {
  const data = pickRequisiteFields(req.body, true);
  const requisite = await prisma.requisite.update({
    where: { id: req.params.id },
    data,
    include: { trader: { select: { id: true, email: true } }, device: true },
  });
  res.json(requisite);
});

// --- Orders overview ---
router.get('/orders', async (req, res) => {
  const { status, page = '1', limit = '50' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const where = status ? { status: status as never } : {};
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        trader: { select: { id: true, email: true } },
        merchant: { select: { id: true, email: true } },
        requisite: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.order.count({ where }),
  ]);
  res.json({ orders, total });
});

// --- Currencies ---
router.get('/currencies', async (_req, res) => {
  const currencies = await getAllCurrencies(false);
  res.json(currencies);
});

router.patch('/currencies/:code', async (req: AuthRequest, res: Response) => {
  const { rateToUsdt, isActive, name, symbol } = req.body;
  const c = await upsertCurrency({
    code: req.params.code,
    name: name || req.params.code,
    region: req.body.region || 'GLOBAL',
    symbol,
    rateToUsdt: parseNumber(rateToUsdt, 1),
    isActive: isActive ?? true,
  });
  res.json(c);
});

// --- Commission rates (ставки) ---
router.get('/commissions', async (_req, res) => {
  const rates = await prisma.commissionRate.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(rates);
});

router.post('/commissions', async (req: AuthRequest, res: Response) => {
  const { name, targetType, targetId, role, payInRate, payOutRate, isActive } = req.body;
  const rate = await upsertCommissionRate({
    name,
    targetType: targetType || 'GLOBAL',
    targetId,
    role,
    payInRate: parseNumber(payInRate, 1.5),
    payOutRate: parseNumber(payOutRate, 1.0),
    isActive,
    updatedBy: req.user!.id,
  });
  res.status(201).json(rate);
});

router.patch('/commissions/:id', async (req: AuthRequest, res: Response) => {
  const { name, targetType, targetId, role, payInRate, payOutRate, isActive } = req.body;
  const rate = await upsertCommissionRate({
    id: req.params.id,
    name,
    targetType,
    targetId,
    role,
    payInRate: parseNumber(payInRate, 1.5),
    payOutRate: parseNumber(payOutRate, 1.0),
    isActive,
    updatedBy: req.user!.id,
  });
  res.json(rate);
});

// --- Wallet deposits ---
router.get('/deposits', async (_req, res) => {
  const deposits = await prisma.walletDeposit.findMany({
    include: {
      wallet: true,
      trader: { select: { id: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(deposits);
});

router.post('/deposits/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.$transaction((tx) => approveWalletDepositTx(tx, req.params.id, req.user!.id));
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

router.post('/deposits/:id/reject', async (req: AuthRequest, res: Response) => {
  await prisma.walletDeposit.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', reviewedBy: req.user!.id, reviewedAt: new Date() },
  });
  res.json({ success: true });
});

export default router;
