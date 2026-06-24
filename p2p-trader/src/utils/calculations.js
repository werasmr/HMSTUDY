/**
 * P2P Deal Math
 *
 * Flow: Buyer pays buyAmount → Operator sends sendAmount from own card → Seller receives sellAmount
 *
 * Buffer (Дисбаланс) = buyAmount − sendAmount
 *   Shows how much fiat is "stuck" in the operator's buffer/exchange.
 *   Positive = operator is net holder. Negative = operator over-sent.
 *
 * PnL = buyAmount − sellAmount
 *   Gross ruble margin: what was received from buyer minus what was paid to seller.
 *   Rewards and rates influence crypto volumes; the ruble margin is the spread.
 */
export function calcDealMath(deal) {
  const buy     = parseFloat(deal.buyAmount)  || 0;
  const buyRate = parseFloat(deal.buyRate)    || 0;
  const buyRew  = parseFloat(deal.buyReward)  || 0;
  const send    = parseFloat(deal.sendAmount) || 0;
  const sell    = parseFloat(deal.sellAmount) || 0;
  const sellRate = parseFloat(deal.sellRate)  || 0;
  const sellRew  = parseFloat(deal.sellReward) || 0;

  const cryptoBuy  = buyRate  > 0 ? buy  / buyRate  : 0;
  const cryptoSell = sellRate > 0 ? sell / sellRate : 0;

  const effBuyRate  = buyRate  > 0 ? buyRate  * (1 + buyRew  / 100) : 0;
  const effSellRate = sellRate > 0 ? sellRate * (1 + sellRew / 100) : 0;

  const buffer = buy - send;   // дисбаланс: зависший фиат
  const pnl    = buy - sell;   // чистый спред в рублях

  return {
    cryptoBuy:    cryptoBuy.toFixed(4),
    cryptoSell:   cryptoSell.toFixed(4),
    effBuyRate:   effBuyRate.toFixed(2),
    effSellRate:  effSellRate.toFixed(2),
    buffer:       buffer.toFixed(2),
    pnl:          pnl.toFixed(2),
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
