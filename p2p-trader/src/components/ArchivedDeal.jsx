import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, TrendingUp, Clock } from 'lucide-react';
import { calcDealMath, formatMoney } from '../utils/calculations';

export default function ArchivedDeal({ deal, cards }) {
  const [expanded, setExpanded] = useState(false);

  const math = calcDealMath({
    buyAmount: deal.stage1.buyAmount,
    buyRate: deal.stage1.buyRate,
    buyReward: deal.stage1.buyReward,
    sendAmount: deal.stage2.sendAmount,
    sellAmount: deal.stage3.sellAmount,
    sellRate: deal.stage3.sellRate,
    sellReward: deal.stage3.sellReward,
  });

  const pnlNum = parseFloat(math.pnl);
  const card = cards.find(c => c.id === deal.stage2.cardId);
  const isCompleted = deal.closeReason === 'completed';
  const closedAt = deal.closedAt ? new Date(deal.closedAt).toLocaleString('ru-RU') : '—';

  return (
    <div className={`rounded-lg border px-3 py-2 ${
      isCompleted
        ? 'border-emerald-500/20 bg-emerald-500/5'
        : 'border-red-500/20 bg-red-500/5'
    }`}>
      <div className="flex items-center gap-3">
        {isCompleted
          ? <CheckCircle size={14} className="text-emerald-400 shrink-0" />
          : <XCircle size={14} className="text-red-400 shrink-0" />
        }
        <span className="text-gray-500 text-xs font-mono">#{deal.id}</span>
        <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCompleted ? 'Завершена' : 'Отменена / Спор'}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          {isCompleted && (
            <span className={`font-mono text-xs font-semibold ${pnlNum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pnlNum >= 0 ? '+' : ''}{formatMoney(math.pnl)} ₽
            </span>
          )}
          <span className="text-gray-600 text-xs hidden sm:inline ml-2">{closedAt}</span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-gray-600 hover:text-gray-400 ml-1 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-fade-in">
          <MiniStat label="Приём" value={`${formatMoney(deal.stage1.buyAmount)} ₽`} />
          <MiniStat label="Отправка" value={`${formatMoney(deal.stage2.sendAmount)} ₽`} />
          <MiniStat label="Выплата" value={`${formatMoney(deal.stage3.sellAmount)} ₽`} />
          <MiniStat label="Карта" value={card ? `${card.bankName} •${card.lastFour}` : '—'} />
          <MiniStat label="Курс покупки" value={`${formatMoney(deal.stage1.buyRate, 2)} ₽`} />
          <MiniStat label="Курс продажи" value={`${formatMoney(deal.stage3.sellRate, 2)} ₽`} />
          <MiniStat label="Крипто (покуп.)" value={`${math.cryptoBuyVolume} USDT`} />
          <MiniStat label="PnL" value={`${pnlNum >= 0 ? '+' : ''}${formatMoney(math.pnl)} ₽`} highlight={pnlNum >= 0 ? 'green' : 'red'} />
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, highlight }) {
  const colorMap = {
    green: 'text-emerald-400',
    red: 'text-red-400',
  };
  return (
    <div>
      <div className="text-gray-600 text-xs">{label}</div>
      <div className={`text-xs font-mono font-medium ${highlight ? colorMap[highlight] : 'text-gray-300'}`}>{value}</div>
    </div>
  );
}
