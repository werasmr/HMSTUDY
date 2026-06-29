export function formatAmount(amount: number, currency: 'RUB' | 'USDT'): string {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: currency === 'USDT' ? 2 : 0,
    maximumFractionDigits: currency === 'USDT' ? 2 : 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function getUsdtRate(): number {
  return parseFloat(process.env.USDT_RUB_RATE || '81.3');
}

export function rubToUsdt(rub: number, rate?: number): number {
  const r = rate ?? getUsdtRate();
  return Math.round((rub / r) * 100) / 100;
}
