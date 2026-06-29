import prisma from '../lib/prisma';
import { Requisite, OrderStatus } from '@prisma/client';
import { rubToUsdt, getUsdtRate } from '../utils/format';

interface MatchResult {
  requisite: Requisite;
  amount: number;
  amountUsdt: number;
  rate: number;
}

export async function findMatchingRequisite(
  amount: number,
  type: 'PAY_IN' | 'PAY_OUT' = 'PAY_IN'
): Promise<MatchResult | null> {
  const rate = getUsdtRate();

  const requisites = await prisma.requisite.findMany({
    where: {
      isActive: true,
      isArchived: false,
      trader: { isOnline: true },
    },
    include: {
      trader: true,
      device: true,
      orders: {
        where: {
          status: { in: ['PENDING', 'WAITING_PAYMENT', 'PAID'] },
        },
      },
    },
  });

  const candidates: Array<{ requisite: typeof requisites[0]; score: number; finalAmount: number }> = [];

  for (const req of requisites) {
    if (amount < req.minOrder || amount > req.maxOrder) continue;
    if (req.dailyLimit > 0 && req.dailyUsed + amount > req.dailyLimit) continue;
    if (req.totalLimit > 0 && req.totalUsed + amount > req.totalLimit) continue;
    if (req.paymentsToday >= req.maxPaymentsPerDay) continue;

    const activeDeals = req.orders.length;
    if (activeDeals >= req.maxParallelDeals) continue;

    if (req.delayBetweenOrders > 0 && req.lastOrderAt) {
      const minutesSince = (Date.now() - req.lastOrderAt.getTime()) / 60000;
      if (minutesSince < req.delayBetweenOrders) continue;
    }

    let finalAmount = amount;
    if (req.useUniqueAmounts) {
      finalAmount = amount + Math.floor(Math.random() * 9) + 1;
    }

    const activeOrdersCount = req.orders.length;
    candidates.push({ requisite: req, score: activeOrdersCount, finalAmount });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.score - b.score);
  const selected = candidates[0];
  const amountUsdt = rubToUsdt(selected.finalAmount, rate);

  return {
    requisite: selected.requisite,
    amount: selected.finalAmount,
    amountUsdt,
    rate,
  };
}

export async function freezeTraderBalance(traderId: string, amountUsdt: number, orderId: string) {
  const trader = await prisma.user.findUnique({ where: { id: traderId } });
  if (!trader) throw new Error('Trader not found');
  if (trader.balance - trader.frozenBalance < amountUsdt) {
    throw new Error('Insufficient balance');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: traderId },
      data: { frozenBalance: { increment: amountUsdt } },
    }),
    prisma.transaction.create({
      data: {
        userId: traderId,
        orderId,
        type: 'FREEZE',
        amount: amountUsdt,
        currency: 'USDT',
      },
    }),
  ]);
}

export async function confirmOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { trader: true, requisite: true },
  });
  if (!order || !order.traderId) throw new Error('Order not found');

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    }),
    prisma.user.update({
      where: { id: order.traderId },
      data: {
        frozenBalance: { decrement: order.amountUsdt },
        balance: { decrement: order.amountUsdt },
      },
    }),
    prisma.transaction.create({
      data: {
        userId: order.traderId,
        orderId,
        type: 'WITHDRAWAL',
        amount: order.amountUsdt,
        currency: 'USDT',
      },
    }),
    ...(order.requisiteId
      ? [
          prisma.requisite.update({
            where: { id: order.requisiteId },
            data: {
              dailyUsed: { increment: order.amount },
              totalUsed: { increment: order.amount },
              paymentsToday: { increment: 1 },
            },
          }),
        ]
      : []),
  ]);
}

export async function expireOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.traderId) return;
  if (order.status === 'CONFIRMED' || order.status === 'EXPIRED') return;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'EXPIRED' },
    }),
    prisma.user.update({
      where: { id: order.traderId },
      data: { frozenBalance: { decrement: order.amountUsdt } },
    }),
    prisma.transaction.create({
      data: {
        userId: order.traderId,
        orderId,
        type: 'UNFREEZE',
        amount: order.amountUsdt,
        currency: 'USDT',
      },
    }),
  ]);
}

export function getRequisiteType(requisite: Requisite): 'СБП' | 'Карта' | 'Счёт' {
  if (requisite.acceptSbp && requisite.phone) return 'СБП';
  if (requisite.acceptAccount && requisite.accountNumber) return 'Счёт';
  return 'Карта';
}

export function getRequisiteNumber(requisite: Requisite): string {
  if (requisite.acceptSbp && requisite.phone) return requisite.phone;
  if (requisite.acceptAccount && requisite.accountNumber) return requisite.accountNumber;
  return requisite.cardNumber || '';
}

export async function sendWebhook(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.callbackUrl) return;

  const payload = {
    orderId: order.id,
    merchantOrderId: order.merchantOrderId,
    status: order.status,
    amount: order.amount,
    amountUsdt: order.amountUsdt,
    rate: order.rate,
  };

  try {
    await fetch(order.callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Webhook failed:', err);
  }
}

export async function processExpiredOrders() {
  const expired = await prisma.order.findMany({
    where: {
      status: { in: ['PENDING', 'WAITING_PAYMENT'] },
      expiresAt: { lt: new Date() },
    },
  });

  for (const order of expired) {
    await expireOrder(order.id);
    await sendWebhook(order.id);
  }
}
