export function calcDealMath(deal) {
  const buy = parseFloat(deal.buyAmount) || 0;
  const buyRate = parseFloat(deal.buyRate) || 0;
  const buyRew = parseFloat(deal.buyReward) || 0;
  const send = parseFloat(deal.sendAmount) || 0;
  const sell = parseFloat(deal.sellAmount) || 0;
  const sellRate = parseFloat(deal.sellRate) || 0;
  const sellRew = parseFloat(deal.sellReward) || 0;

  const cryptoBuy = buyRate > 0 ? buy / buyRate : 0;
  const cryptoSell = sellRate > 0 ? sell / sellRate : 0;

  const effBuyRate = buyRate > 0 ? buyRate * (1 + buyRew / 100) : 0;
  const effSellRate = sellRate > 0 ? sellRate * (1 + sellRew / 100) : 0;

  const imbalance = buy - send - sell;
  const pnl = buy - (send > 0 ? send : sell) - sell + (send > 0 ? 0 : 0);
  const netPnL = buy - send - sell;

  return {
    cryptoBuy: cryptoBuy.toFixed(4),
    cryptoSell: cryptoSell.toFixed(4),
    effBuyRate: effBuyRate.toFixed(2),
    effSellRate: effSellRate.toFixed(2),
    imbalance: imbalance.toFixed(2),
    pnl: netPnL.toFixed(2),
  };
}

export function fmt(n, dec = 0) {
  const num = parseFloat(n) || 0;
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(num);
}

export function generateId() {
  return Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}
