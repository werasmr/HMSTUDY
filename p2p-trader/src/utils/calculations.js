export function toNumber(value) {
  return Number.parseFloat(String(value ?? '').replace(',', '.')) || 0;
}

export function inputDollar(input) {
  const amount = toNumber(input.amount);
  const rate = toNumber(input.rate);
  if (rate <= 0) return 0;
  return amount / rate;
}

export function outputDollar(route) {
  const amount = toNumber(route.amount);
  const rate = toNumber(route.rate);
  if (rate <= 0) return 0;
  return amount / rate;
}

export function calcRouteMath(route) {
  const inputs = route.inputs ?? [];
  const payoutRate = toNumber(route.rate);
  const totalInputAmount = inputs.reduce((sum, input) => sum + toNumber(input.amount), 0);
  const totalInputDollar = inputs.reduce((sum, input) => sum + inputDollar(input), 0);
  const outputDollarValue = outputDollar(route);
  const remainingDollar = outputDollarValue - totalInputDollar;
  const topUpRub = remainingDollar > 0 ? remainingDollar * payoutRate : 0;

  const inputRewardProfit = inputs.reduce((sum, input) => {
    return sum + toNumber(input.amount) * (toNumber(input.reward) / 100);
  }, 0);

  const outputLossRub = inputs.reduce((sum, input) => {
    const inputRate = toNumber(input.rate);
    if (payoutRate <= 0) return sum;
    return sum + (inputRate / payoutRate) * toNumber(input.amount);
  }, 0);

  const totalProfit = inputRewardProfit - (outputLossRub + topUpRub);

  return {
    totalInputAmount,
    totalInputDollar,
    outputDollar: outputDollarValue,
    remainingDollar,
    topUpRub,
    inputRewardProfit,
    outputLossRub,
    totalProfit,
    // Backward-compatible aliases used by stats/archive during transitions.
    pnl: totalProfit,
    remaining: topUpRub,
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
