import prisma from '../lib/prisma';
import { Role, CommissionTarget } from '@prisma/client';
import { roundUsdt } from './ledger';

export async function getRateToUsdt(currencyCode: string): Promise<number> {
  if (currencyCode === 'USDT' || currencyCode === 'USD') return 1;
  const c = await prisma.currencyConfig.findUnique({ where: { code: currencyCode } });
  if (!c || !c.isActive) throw new Error(`Currency ${currencyCode} not supported`);
  return c.rateToUsdt;
}

export function fiatToUsdt(amount: number, rateToUsdt: number): number {
  return roundUsdt(amount / rateToUsdt);
}

export async function getCommissionRate(
  type: 'PAY_IN' | 'PAY_OUT',
  traderId?: string,
  merchantId?: string
): Promise<number> {
  const rates = await prisma.commissionRate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  let rate = rates.find((r) => r.targetType === 'GLOBAL' && !r.targetId);

  if (merchantId) {
    const merchantRate = rates.find((r) => r.targetType === 'MERCHANT' && r.targetId === merchantId);
    if (merchantRate) rate = merchantRate;
  }

  if (traderId) {
    const traderRate = rates.find((r) => r.targetType === 'TRADER' && r.targetId === traderId);
    if (traderRate) rate = traderRate;
  }

  if (!rate) return type === 'PAY_IN' ? 1.5 : 1.0;
  return type === 'PAY_IN' ? rate.payInRate : rate.payOutRate;
}

export async function getAllCurrencies(activeOnly = true) {
  return prisma.currencyConfig.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ region: 'asc' }, { code: 'asc' }],
  });
}

export async function upsertCurrency(data: {
  code: string;
  name: string;
  region: string;
  symbol?: string;
  rateToUsdt: number;
  isActive?: boolean;
  decimals?: number;
}) {
  return prisma.currencyConfig.upsert({
    where: { code: data.code },
    update: {
      name: data.name,
      region: data.region,
      symbol: data.symbol ?? '',
      rateToUsdt: data.rateToUsdt,
      isActive: data.isActive ?? true,
      decimals: data.decimals ?? 2,
    },
    create: {
      code: data.code,
      name: data.name,
      region: data.region,
      symbol: data.symbol ?? '',
      rateToUsdt: data.rateToUsdt,
      isActive: data.isActive ?? true,
      decimals: data.decimals ?? 2,
    },
  });
}

export async function upsertCommissionRate(data: {
  id?: string;
  name: string;
  targetType: CommissionTarget;
  targetId?: string;
  role?: Role;
  payInRate: number;
  payOutRate: number;
  isActive?: boolean;
  updatedBy?: string;
}) {
  if (data.id) {
    return prisma.commissionRate.update({
      where: { id: data.id },
      data: {
        name: data.name,
        targetType: data.targetType,
        targetId: data.targetId,
        role: data.role,
        payInRate: data.payInRate,
        payOutRate: data.payOutRate,
        isActive: data.isActive ?? true,
        updatedBy: data.updatedBy,
      },
    });
  }
  return prisma.commissionRate.create({ data });
}
