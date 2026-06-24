export function calcDealMath(deal) {
  const buyAmount = parseFloat(deal.buyAmount) || 0;
  const buyRate = parseFloat(deal.buyRate) || 0;
  const buyReward = parseFloat(deal.buyReward) || 0;
  const sendAmount = parseFloat(deal.sendAmount) || 0;
  const sellAmount = parseFloat(deal.sellAmount) || 0;
  const sellRate = parseFloat(deal.sellRate) || 0;
  const sellReward = parseFloat(deal.sellReward) || 0;

  const cryptoBuyVolume = buyRate > 0 ? buyAmount / buyRate : 0;
  const cryptoSellVolume = sellRate > 0 ? sellAmount / sellRate : 0;

  const effectiveBuyRate = buyRate * (1 + buyReward / 100);
  const effectiveSellRate = sellRate * (1 + sellReward / 100);

  const buyAmountWithReward = cryptoBuyVolume * effectiveBuyRate;
  const sellAmountWithReward = cryptoSellVolume * effectiveSellRate;

  const imbalance = buyAmount - sendAmount - sellAmount;

  let pnl = 0;
  if (buyAmount > 0 && sellAmount > 0) {
    const rewardFromBuyer = buyAmount * (buyReward / 100);
    const rewardFromSeller = sellAmount * (sellReward / 100);
    const spreadProfit = buyAmount - sellAmount - (sendAmount > 0 ? sendAmount - (buyAmount - sellAmount) : 0);
    pnl = rewardFromBuyer + rewardFromSeller + (buyAmount - sendAmount - sellAmount);
  }

  const totalIn = buyAmount;
  const totalOut = sendAmount + sellAmount;
  const netPnL = totalIn - totalOut;

  return {
    cryptoBuyVolume: cryptoBuyVolume.toFixed(6),
    cryptoSellVolume: cryptoSellVolume.toFixed(6),
    effectiveBuyRate: effectiveBuyRate.toFixed(2),
    effectiveSellRate: effectiveSellRate.toFixed(2),
    imbalance: imbalance.toFixed(2),
    pnl: netPnL.toFixed(2),
    totalIn,
    totalOut,
  };
}

export function formatMoney(amount, decimals = 2) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCrypto(amount) {
  const num = parseFloat(amount) || 0;
  return num.toFixed(6);
}

export function generateId() {
  return Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}
