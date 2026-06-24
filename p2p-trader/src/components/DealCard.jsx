import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, FileText, CreditCard, User, ArrowDownCircle, Send, ArrowUpCircle } from 'lucide-react';
import { calcDealMath, formatMoney } from '../utils/calculations';
import { playAlertSound, sendDealExpiredNotification } from '../utils/sound';

export default function DealCard({ deal, cards, onComplete, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, deal.expiresAt - Date.now()));
  const [alerted, setAlerted] = useState(deal.expired || timeLeft === 0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (deal.status !== 'active') return;

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, deal.expiresAt - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0 && !alerted) {
        setAlerted(true);
        playAlertSound();
        sendDealExpiredNotification(deal.id);
        clearInterval(intervalRef.current);
      }
    }, 500);

    return () => clearInterval(intervalRef.current);
  }, [deal.expiresAt, deal.status, alerted, deal.id]);

  const math = calcDealMath({
    buyAmount: deal.stage1.buyAmount,
    buyRate: deal.stage1.buyRate,
    buyReward: deal.stage1.buyReward,
    sendAmount: deal.stage2.sendAmount,
    sellAmount: deal.stage3.sellAmount,
    sellRate: deal.stage3.sellRate,
    sellReward: deal.stage3.sellReward,
  });

  const imbalanceNum = parseFloat(math.imbalance);
  const pnlNum = parseFloat(math.pnl);
  const isExpired = timeLeft === 0;
  const isCritical = timeLeft > 0 && timeLeft < 60000;

  const card = cards.find(c => c.id === deal.stage2.cardId);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPct = deal.timerMinutes > 0
    ? Math.max(0, (timeLeft / (deal.timerMinutes * 60000)) * 100)
    : 0;

  return (
    <div className={`glass-card rounded-xl overflow-hidden border transition-all duration-300 animate-fade-in ${
      isExpired
        ? 'border-red-500/40 neon-border-red'
        : isCritical
        ? 'border-orange-500/40'
        : 'border-dark-400/60 hover:border-dark-300/60'
    }`}>
      {/* Progress bar */}
      <div className="h-0.5 bg-dark-600 w-full">
        <div
          className={`h-full transition-all duration-500 ${
            isExpired ? 'bg-red-500' : isCritical ? 'bg-orange-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-500 text-xs font-mono">#{deal.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isExpired
                ? 'bg-red-500/20 text-red-400'
                : isCritical
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isExpired ? 'Истекло!' : 'Активна'}
            </span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 font-mono font-semibold text-sm ${
            isExpired ? 'text-red-400 timer-critical' : isCritical ? 'text-orange-400' : 'text-gray-300'
          }`}>
            <Clock size={13} />
            {timerStr}
          </div>
        </div>

        {/* Amounts row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <AmountCell
            icon={<ArrowDownCircle size={11} className="text-emerald-400" />}
            label="Приём"
            value={formatMoney(deal.stage1.buyAmount)}
            color="emerald"
          />
          <AmountCell
            icon={<Send size={11} className="text-blue-400" />}
            label="Отправка"
            value={formatMoney(deal.stage2.sendAmount)}
            color="blue"
          />
          <AmountCell
            icon={<ArrowUpCircle size={11} className="text-orange-400" />}
            label="Выплата"
            value={formatMoney(deal.stage3.sellAmount)}
            color="orange"
          />
        </div>

        {/* Imbalance & PnL */}
        <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-dark-400/40">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={11} className={imbalanceNum === 0 ? 'text-gray-600' : imbalanceNum > 0 ? 'text-emerald-400' : 'text-red-400'} />
            <span className="text-gray-500 text-xs">Дисбаланс:</span>
            <span className={`font-mono text-xs font-semibold ${
              imbalanceNum > 0 ? 'text-emerald-400' : imbalanceNum < 0 ? 'text-red-400' : 'text-gray-500'
            }`}>
              {imbalanceNum > 0 ? '+' : ''}{formatMoney(math.imbalance)} ₽
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <TrendingUp size={11} className={pnlNum >= 0 ? 'text-emerald-400' : 'text-red-400'} />
            <span className="text-gray-500 text-xs">PnL:</span>
            <span className={`font-mono text-xs font-semibold ${pnlNum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pnlNum >= 0 ? '+' : ''}{formatMoney(math.pnl)} ₽
            </span>
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-gray-500 hover:text-gray-300 transition-colors ml-1"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-dark-400/30 pt-3 space-y-3 animate-fade-in">
          {/* Stage 1 */}
          <StageDetails
            icon={<ArrowDownCircle size={13} className="text-emerald-400" />}
            title="Покупатель"
            color="emerald"
          >
            <DetailRow label="Сумма" value={`${formatMoney(deal.stage1.buyAmount)} ₽`} mono />
            <DetailRow label="Курс" value={`${formatMoney(deal.stage1.buyRate, 2)} ₽/USDT`} mono />
            <DetailRow label="Награда" value={`${deal.stage1.buyReward}%`} mono />
            <DetailRow label="Крипто" value={`${math.cryptoBuyVolume} USDT`} mono />
            <DetailRow label="Реквизиты" value={deal.stage1.buyerRequisites || '—'} />
            {deal.stage1.receiptName && (
              <div className="flex items-center gap-1.5 text-blue-400 text-xs mt-1">
                <FileText size={11} />
                <span className="truncate">{deal.stage1.receiptName}</span>
              </div>
            )}
          </StageDetails>

          {/* Stage 2 */}
          <StageDetails
            icon={<Send size={13} className="text-blue-400" />}
            title="Моя карта"
            color="blue"
          >
            {card && (
              <DetailRow
                label="Карта"
                value={`${card.bankName} •••• ${card.lastFour}`}
                icon={<CreditCard size={11} />}
              />
            )}
            <DetailRow label="Отправлено" value={`${formatMoney(deal.stage2.sendAmount)} ₽`} mono />
          </StageDetails>

          {/* Stage 3 */}
          <StageDetails
            icon={<ArrowUpCircle size={13} className="text-orange-400" />}
            title="Продавец"
            color="orange"
          >
            <DetailRow label="Сумма" value={`${formatMoney(deal.stage3.sellAmount)} ₽`} mono />
            <DetailRow label="Курс" value={`${formatMoney(deal.stage3.sellRate, 2)} ₽/USDT`} mono />
            <DetailRow label="Награда" value={`${deal.stage3.sellReward}%`} mono />
            <DetailRow label="Крипто" value={`${math.cryptoSellVolume} USDT`} mono />
            <DetailRow label="Реквизиты" value={deal.stage3.sellerRequisites || '—'} />
            {deal.stage3.receiptName && (
              <div className="flex items-center gap-1.5 text-blue-400 text-xs mt-1">
                <FileText size={11} />
                <span className="truncate">{deal.stage3.receiptName}</span>
              </div>
            )}
          </StageDetails>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => onComplete(deal)}
          className="btn-success text-xs py-2 px-3 flex-1 justify-center"
        >
          <CheckCircle size={13} />
          Успешно завершить
        </button>
        <button
          onClick={() => onCancel(deal)}
          className="btn-danger text-xs py-2 px-3 flex-1 justify-center"
        >
          <XCircle size={13} />
          Отменить / Спор
        </button>
      </div>
    </div>
  );
}

function AmountCell({ icon, label, value, color }) {
  const bgMap = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
  };
  return (
    <div className={`rounded-lg p-2 border ${bgMap[color]}`}>
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <span className="text-gray-500 text-xs">{label}</span>
      </div>
      <div className="font-mono text-white text-xs font-semibold">{value} ₽</div>
    </div>
  );
}

function StageDetails({ icon, title, color, children }) {
  const borderMap = {
    emerald: 'border-l-emerald-500/50',
    blue: 'border-l-blue-500/50',
    orange: 'border-l-orange-500/50',
  };
  return (
    <div className={`bg-dark-700/40 rounded-lg p-3 border-l-2 ${borderMap[color]}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-gray-400 text-xs font-medium">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, icon }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-600 text-xs">{label}:</span>
      <span className={`text-gray-300 text-xs ${mono ? 'font-mono' : ''} truncate`}>{value}</span>
    </div>
  );
}
