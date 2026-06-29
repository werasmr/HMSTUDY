import { Prisma } from '@prisma/client';

export function roundUsdt(n: number): number {
  return Math.round(n * 100) / 100;
}

export function roundFiat(n: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

export function getAvailableBalance(balance: number, frozenBalance: number): number {
  return roundUsdt(balance - frozenBalance);
}

export type TxClient = Prisma.TransactionClient;

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
    data: { userId: traderId, orderId, type: 'FREEZE', amount, currencyCode: 'USDT' },
  });
}

export async function confirmOrderTx(tx: TxClient, orderId: string, feeAmount = 0) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { requisite: true },
  });
  if (!order?.traderId) throw new Error('Order not found');

  const updated = await tx.order.updateMany({
    where: { id: orderId, status: { in: ['WAITING_PAYMENT', 'PAID'] } },
    data: { status: 'CONFIRMED', feeAmount: roundUsdt(feeAmount) },
  });
  if (updated.count === 0) throw new Error('Order cannot be confirmed');

  const amountUsdt = roundUsdt(order.amountUsdt);
  const fee = roundUsdt(feeAmount);
  const totalDebit = roundUsdt(amountUsdt + fee);

  const trader = await tx.user.findUnique({ where: { id: order.traderId } });
  if (!trader) throw new Error('Trader not found');
  if (trader.frozenBalance < amountUsdt) throw new Error('Frozen balance mismatch');
  if (getAvailableBalance(trader.balance, trader.frozenBalance) < fee) {
    throw new Error('Insufficient balance for commission');
  }

  await tx.user.update({
    where: { id: order.traderId },
    data: {
      frozenBalance: { decrement: amountUsdt },
      balance: { decrement: totalDebit },
    },
  });

  await tx.transaction.create({
    data: { userId: order.traderId, orderId, type: 'WITHDRAWAL', amount: amountUsdt, currencyCode: 'USDT' },
  });

  if (fee > 0) {
    await tx.transaction.create({
      data: { userId: order.traderId, orderId, type: 'FEE', amount: fee, currencyCode: 'USDT' },
    });
  }

  if (order.requisiteId) {
    await tx.requisite.update({
      where: { id: order.requisiteId },
      data: {
        dailyUsed: { increment: order.amount },
        totalUsed: { increment: order.amount },
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
      data: { userId: order.traderId, orderId, type: 'UNFREEZE', amount: amountUsdt, currencyCode: 'USDT' },
    });
  }
  return true;
}

export async function adminAdjustBalanceTx(
  tx: TxClient,
  userId: string,
  amount: number,
  type: 'DEPOSIT' | 'WITHDRAWAL',
  _adminId: string
) {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const absAmount = roundUsdt(Math.abs(amount));
  if (absAmount <= 0) throw new Error('Invalid amount');

  if (type === 'WITHDRAWAL') {
    const available = getAvailableBalance(user.balance, user.frozenBalance);
    if (available < absAmount) throw new Error('Insufficient available balance');
    await tx.user.update({ where: { id: userId }, data: { balance: { decrement: absAmount } } });
  } else {
    await tx.user.update({ where: { id: userId }, data: { balance: { increment: absAmount } } });
  }

  await tx.transaction.create({
    data: { userId, type, amount: absAmount, currencyCode: 'USDT' },
  });

  return tx.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, balance: true, frozenBalance: true, insuranceDeposit: true },
  });
}

export async function approveWalletDepositTx(tx: TxClient, depositId: string, adminId: string) {
  const deposit = await tx.walletDeposit.findUnique({ where: { id: depositId } });
  if (!deposit || deposit.status !== 'PENDING') throw new Error('Deposit not found or already processed');

  await tx.walletDeposit.update({
    where: { id: depositId },
    data: { status: 'APPROVED', reviewedBy: adminId, reviewedAt: new Date() },
  });

  const usdtAmount = deposit.currencyCode === 'USDT'
    ? roundUsdt(deposit.amount)
    : roundUsdt(deposit.amount); // admin confirms USDT equivalent in amount field

  await tx.user.update({
    where: { id: deposit.traderId },
    data: { balance: { increment: usdtAmount } },
  });

  await tx.transaction.create({
    data: {
      userId: deposit.traderId,
      type: 'DEPOSIT',
      amount: usdtAmount,
      currencyCode: 'USDT',
    },
  });
}
