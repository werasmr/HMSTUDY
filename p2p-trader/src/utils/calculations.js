export function toNumber(value) {
  return Number.parseFloat(String(value ?? '').replace(',', '.')) || 0;
}

export function inputCrypto(input) {
  const amount = toNumber(input.amount);
  const rate = toNumber(input.rate);
  const reward = toNumber(input.reward);
  if (rate <= 0) return 0;
  return (amount * (1 - reward / 100)) / rate;
}

export function payoutCrypto(route) {
  const amount = toNumber(route.amount);
  const rate = toNumber(route.rate);
  const reward = toNumber(route.reward);
  if (rate <= 0) return 0;
  return (amount * (1 + reward / 100)) / rate;
}

export function calcRouteMath(route) {
  const inputs = route.inputs ?? [];
  const payoutAmount = toNumber(route.amount);
  const payoutRate = toNumber(route.rate);
  const totalInputAmount = inputs.reduce((sum, input) => sum + toNumber(input.amount), 0);
  const totalInputCrypto = inputs.reduce((sum, input) => sum + inputCrypto(input), 0);
  const payoutCryptoValue = payoutCrypto(route);
  const remaining = payoutAmount - totalInputAmount;
  const pnl = (totalInputCrypto - payoutCryptoValue) * payoutRate;

  return {
    totalInputAmount,
    totalInputCrypto,
    payoutCrypto: payoutCryptoValue,
    remaining,
    pnl,
  };
}

export function fmt(n, dec = 0) {
  const num = toNumber(n);
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(num);
}

export function generateId() {
  return Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}
