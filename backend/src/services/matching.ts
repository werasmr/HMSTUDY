import prisma from '../lib/prisma';
import { Requisite } from '@prisma/client';
import { fiatToUsdt, getRateToUsdt, getCommissionRate } from './currency';
import {
  freezeTraderBalanceTx,
  confirmOrderTx,
  releaseOrderFundsTx,
  roundUsdt,
} from './ledger';

interface MatchResult {
  requisite: Requisite;
  amount: number;
  currencyCode: string;
  amountUsdt: number;
  rate: number;
  feeRate: number;
}

export async function findMatchingRequisite(
  amount: number,
  currencyCode: string,
  merchantId?: string
): Promise<MatchResult | null> {
  const rate = await getRateToUsdt(currencyCode);
  const feeRate = await getCommissionRate('PAY_IN', undefined, merchantId);

  const requisites = await prisma.requisite.findMany({
    where: {
      isActive: true,
      isArchived: false,
      currencyCode,
      trader: { isOnline: true, isActive: true, role: 'TRADER' },
    },
    include: {
      trader: true,
      orders: { where: { status: { in: ['PENDING', 'WAITING_PAYMENT', 'PAID'] } } },
    },
  });

  const candidates: Array<{ requisite: typeof requisites[0]; score: number; finalAmount: number }> = [];

  for (const req of requisites) {
    if (amount < req.minOrder || amount > req.maxOrder) continue;
    if (req.dailyLimit > 0 && req.dailyUsed + amount > req.dailyLimit) continue;
    if (req.totalLimit > 0 && req.totalUsed + amount > req.totalLimit) continue;
    if (req.paymentsToday >= req.maxPaymentsPerDay) continue;
    if (req.orders.length >= req.maxParallelDeals) continue;

    if (req.delayBetweenOrders > 0 && req.lastOrderAt) {
      const mins = (Date.now() - req.lastOrderAt.getTime()) / 60000;
      if (mins < req.delayBetweenOrders) continue;
    }

    let finalAmount = amount;
    if (req.useUniqueAmounts) {
      finalAmount = amount + Math.floor(Math.random() * 9) + 1;
      if (finalAmount > req.maxOrder) continue;
    }

    const amountUsdt = fiatToUsdt(finalAmount, rate);
    const available = req.trader.balance - req.trader.frozenBalance;
    if (available < amountUsdt || req.trader.insuranceDeposit <= 0) continue;

    candidates.push({ requisite: req, score: req.orders.length, finalAmount });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.score - b.score);
  const selected = candidates[0];

  return {
    requisite: selected.requisite,
    amount: selected.finalAmount,
    currencyCode,
    amountUsdt: fiatToUsdt(selected.finalAmount, rate),
    rate,
    feeRate,
  };
}

export async function createPaymentOrder(params: {
  merchantId: string;
  merchantOrderId?: string;
  callbackUrl?: string;
  successUrl?: string;
  match: MatchResult;
  expiresAt: Date;
}) {
  const { merchantId, merchantOrderId, callbackUrl, successUrl, match, expiresAt } = params;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        merchantOrderId,
        type: 'PAY_IN',
        status: 'WAITING_PAYMENT',
        amount: match.amount,
        currencyCode: match.currencyCode,
        amountUsdt: match.amountUsdt,
        rate: match.rate,
        feeRate: match.feeRate,
        requisiteId: match.requisite.id,
        traderId: match.requisite.traderId,
        merchantId,
        callbackUrl,
        successUrl,
        expiresAt,
      },
    });

    await freezeTraderBalanceTx(tx, match.requisite.traderId, match.amountUsdt, order.id);
    await tx.requisite.update({
      where: { id: match.requisite.id },
      data: { lastOrderAt: new Date() },
    });
    return order;
  });
}

export async function confirmOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.traderId) throw new Error('Order not found');

  const feeRate = order.feeRate || await getCommissionRate('PAY_IN', order.traderId, order.merchantId ?? undefined);
  const feeAmount = roundUsdt(order.amountUsdt * (feeRate / 100));

  await prisma.$transaction((tx) => confirmOrderTx(tx, orderId, feeAmount));
}

export async function cancelOrder(orderId: string) {
  await prisma.$transaction((tx) => releaseOrderFundsTx(tx, orderId, 'CANCELLED'));
}

export async function expireOrder(orderId: string) {
  await prisma.$transaction((tx) => releaseOrderFundsTx(tx, orderId, 'EXPIRED'));
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

  try {
    await fetch(order.callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        merchantOrderId: order.merchantOrderId,
        status: order.status,
        amount: order.amount,
        currencyCode: order.currencyCode,
        amountUsdt: order.amountUsdt,
        rate: order.rate,
        feeRate: order.feeRate,
        feeAmount: order.feeAmount,
      }),
    });
  } catch (err) {
    console.error('Webhook failed:', err);
  }
}

export async function processExpiredOrders() {
  const expired = await prisma.order.findMany({
    where: { status: { in: ['PENDING', 'WAITING_PAYMENT'] }, expiresAt: { lt: new Date() } },
  });
  for (const order of expired) {
    await expireOrder(order.id);
    await sendWebhook(order.id);
  }
}

export async function resetDailyRequisiteCounters() {
  await prisma.requisite.updateMany({ data: { paymentsToday: 0, dailyUsed: 0 } });
}
