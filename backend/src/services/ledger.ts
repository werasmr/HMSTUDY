import { Prisma } from '@prisma/client';

/** Round USDT to 2 decimal places to avoid float drift */
export function roundUsdt(n: number): number {
  return Math.round(n * 100) / 100;
}

export function roundRub(n: number): number {
  return Math.round(n * 100) / 100;
}

export function getAvailableBalance(balance: number, frozenBalance: number): number {
  return roundUsdt(balance - frozenBalance);
}

export type TxClient = Prisma.TransactionClient;

const TERMINAL_ORDER_STATUSES = ['CONFIRMED', 'EXPIRED', 'CANCELLED'] as const;

export async function freezeTraderBalanceTx(
  tx: TxClient,
  traderId: string,
  amountUsdt: number,
  orderId: string
) {
  const amount = roundUsdt(amountUsdt);
  const trader = await tx.user.findUnique({ where: { id: traderId } });
  if (!trader || !trader.isActive) throw new Error('Trader not found or inactive');
  if (trader.role !== 'TRADER') throw new Error('User is not a trader');
  if (trader.insuranceDeposit <= 0) throw new Error('Insurance deposit required');

  const available = getAvailableBalance(trader.balance, trader.frozenBalance);
  if (available < amount) throw new Error('Insufficient balance');

  await tx.user.update({
    where: { id: traderId },
    data: { frozenBalance: { increment: amount } },
  });

  await tx.transaction.create({
    data: {
      userId: traderId,
      orderId,
      type: 'FREEZE',
      amount,
      currency: 'USDT',
    },
  });
}

export async function confirmOrderTx(tx: TxClient, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { requisite: true },
  });
  if (!order?.traderId) throw new Error('Order not found');

  const updated = await tx.order.updateMany({
    where: {
      id: orderId,
      status: { in: ['WAITING_PAYMENT', 'PAID'] },
    },
    data: { status: 'CONFIRMED' },
  });
  if (updated.count === 0) throw new Error('Order cannot be confirmed');

  const amountUsdt = roundUsdt(order.amountUsdt);
  const trader = await tx.user.findUnique({ where: { id: order.traderId } });
  if (!trader) throw new Error('Trader not found');
  if (trader.frozenBalance < amountUsdt) throw new Error('Frozen balance mismatch');

  await tx.user.update({
    where: { id: order.traderId },
    data: {
      frozenBalance: { decrement: amountUsdt },
      balance: { decrement: amountUsdt },
    },
  });

  await tx.transaction.create({
    data: {
      userId: order.traderId,
      orderId,
      type: 'WITHDRAWAL',
      amount: amountUsdt,
      currency: 'USDT',
    },
  });

  if (order.requisiteId) {
    await tx.requisite.update({
      where: { id: order.requisiteId },
      data: {
        dailyUsed: { increment: roundRub(order.amount) },
        totalUsed: { increment: roundRub(order.amount) },
        paymentsToday: { increment: 1 },
      },
    });
  }
}

export async function releaseOrderFundsTx(
  tx: TxClient,
  orderId: string,
  newStatus: 'EXPIRED' | 'CANCELLED'
) {
  const order = await tx.order.findUnique({ where: { id: orderId } });
  if (!order?.traderId) return false;

  const updated = await tx.order.updateMany({
    where: {
      id: orderId,
      status: { in: ['PENDING', 'WAITING_PAYMENT', 'PAID', 'DISPUTED'] },
    },
    data: { status: newStatus },
  });
  if (updated.count === 0) return false;

  const amountUsdt = roundUsdt(order.amountUsdt);
  const trader = await tx.user.findUnique({ where: { id: order.traderId } });
  if (!trader) return false;

  if (trader.frozenBalance >= amountUsdt) {
    await tx.user.update({
      where: { id: order.traderId },
      data: { frozenBalance: { decrement: amountUsdt } },
    });

    await tx.transaction.create({
      data: {
        userId: order.traderId,
        orderId,
        type: 'UNFREEZE',
        amount: amountUsdt,
        currency: 'USDT',
      },
    });
  }

  return true;
}

export async function adminAdjustBalanceTx(
  tx: TxClient,
  userId: string,
  amount: number,
  type: 'DEPOSIT' | 'WITHDRAWAL',
  adminId: string,
  note?: string
) {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const absAmount = roundUsdt(Math.abs(amount));
  if (absAmount <= 0) throw new Error('Invalid amount');

  if (type === 'WITHDRAWAL') {
    const available = getAvailableBalance(user.balance, user.frozenBalance);
    if (available < absAmount) throw new Error('Insufficient available balance');
    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: absAmount } },
    });
  } else {
    await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: absAmount } },
    });
  }

  await tx.transaction.create({
    data: {
      userId,
      type,
      amount: absAmount,
      currency: 'USDT',
    },
  });

  return tx.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      balance: true,
      frozenBalance: true,
      insuranceDeposit: true,
    },
  });
}

export { TERMINAL_ORDER_STATUSES };
