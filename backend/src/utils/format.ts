export function formatAmount(amount: number, currencyCode = 'RUB', decimals?: number): string {
  const dec = decimals ?? (currencyCode === 'USDT' || currencyCode === 'USD' ? 2 : 0);
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(amount);
  return `${formatted} ${currencyCode}`;
}

export async function getDefaultRubRate(): Promise<number> {
  return parseFloat(process.env.USDT_RUB_RATE || '81.3');
}
