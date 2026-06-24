import { useState, useEffect, useRef } from 'react';
import { Check, X, ChevronDown, ChevronUp, Upload, FileText } from 'lucide-react';
import { calcDealMath, fmt } from '../utils/calculations';
import { playAlertSound, sendDealExpiredNotification } from '../utils/sound';

export default function DealCard({ deal, cards, onComplete, onCancel, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, deal.expiresAt - Date.now()));
  const notified = useRef(deal.expiresAt <= Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      const left = Math.max(0, deal.expiresAt - Date.now());
      setTimeLeft(left);
      if (left === 0 && !notified.current) {
        notified.current = true;
        playAlertSound();
        sendDealExpiredNotification(deal.id);
      }
    }, 500);
    return () => clearInterval(tick);
  }, [deal.expiresAt, deal.id]);

  const math = calcDealMath(deal);
  const imb = parseFloat(math.imbalance);
  const pnl = parseFloat(math.pnl);
  const expired = timeLeft === 0;
  const critical = !expired && timeLeft < 60000;
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const timer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const pct = Math.max(0, (timeLeft / (deal.timerMinutes * 60000)) * 100);
  const card = cards.find(c => c.id === deal.cardId);

  function handleReceiptUpload(type, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpdate(deal.id, { [type]: file.name });
  }

  return (
    <div className={`bg-[#161b22] border rounded-lg overflow-hidden fade-in ${expired ? 'border-red-500/50' : critical ? 'border-amber-500/40' : 'border-[#30363d]'}`}>
      {/* Timer bar */}
      <div className="h-0.5 bg-[#0d1117]">
        <div
          className={`h-full transition-all duration-1000 ${expired ? 'bg-red-500' : critical ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="px-3 pt-2.5 pb-2">
        {/* Top row: ID + timer + toggle */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e] mono">#{deal.id}</span>
            {expired && <span className="text-xs text-red-400 font-medium">Истекло!</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`mono text-sm font-medium ${expired ? 'text-red-400 timer-blink' : critical ? 'text-amber-400' : 'text-[#c9d1d9]'}`}>
              {timer}
            </span>
            <button onClick={() => setOpen(v => !v)} className="text-[#8b949e] hover:text-white transition-colors">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Amounts */}
        <div className="flex items-center gap-1 text-sm mb-2">
          <AmtBadge label="Приём" value={fmt(deal.buyAmount)} color="emerald" />
          <span className="text-[#484f58]">→</span>
          <AmtBadge
            label={card ? `${card.bankName} ••${card.lastFour}` : 'Отправка'}
            value={deal.sendAmount ? fmt(deal.sendAmount) : '—'}
            color={deal.sendAmount ? 'blue' : 'muted'}
          />
          <span className="text-[#484f58]">→</span>
          <AmtBadge label="Выплата" value={fmt(deal.sellAmount)} color="orange" />
        </div>

        {/* Imbalance + PnL */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#8b949e]">
            Дисбаланс:{' '}
            <span className={`mono font-medium ${imb > 0 ? 'text-emerald-400' : imb < 0 ? 'text-red-400' : 'text-[#8b949e]'}`}>
              {imb > 0 ? '+' : ''}{fmt(math.imbalance, 2)} ₽
            </span>
          </span>
          <span className="text-[#8b949e]">
            PnL:{' '}
            <span className={`mono font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pnl >= 0 ? '+' : ''}{fmt(math.pnl, 2)} ₽
            </span>
          </span>
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-[#30363d] px-3 py-3 space-y-3 fade-in">
          {/* Inline: fill in actual send */}
          <div className="space-y-1.5">
            <div className="text-xs text-[#8b949e] font-medium">Отправка с моей карты</div>
            <div className="flex gap-2">
              <select
                value={deal.cardId}
                onChange={e => onUpdate(deal.id, { cardId: e.target.value })}
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#c9d1d9] focus:outline-none focus:border-blue-500"
              >
                <option value="">— Карта —</option>
                {cards.map(c => (
                  <option key={c.id} value={c.id}>{c.bankName} ••{c.lastFour} ({fmt(c.balance)} ₽)</option>
                ))}
              </select>
              <input
                type="number"
                value={deal.sendAmount}
                onChange={e => onUpdate(deal.id, { sendAmount: e.target.value })}
                placeholder="Сумма ₽"
                className="w-32 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm mono text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-emerald-400/80 font-medium">Покупатель</div>
              <Info label="Сумма" value={`${fmt(deal.buyAmount)} ₽`} />
              <Info label="Курс" value={`${fmt(deal.buyRate, 2)} ₽`} />
              <Info label="Награда" value={`${deal.buyReward || 0}%`} />
              {deal.buyerReq && <Info label="Реквизиты" value={deal.buyerReq} />}
            </div>
            <div className="space-y-1">
              <div className="text-orange-400/80 font-medium">Продавец</div>
              <Info label="Сумма" value={`${fmt(deal.sellAmount)} ₽`} />
              <Info label="Курс" value={`${fmt(deal.sellRate, 2)} ₽`} />
              <Info label="Награда" value={`${deal.sellReward || 0}%`} />
              {deal.sellerReq && <Info label="Реквизиты" value={deal.sellerReq} />}
            </div>
          </div>

          {/* Receipts */}
          <div className="flex gap-2">
            <ReceiptBtn label="Чек покупателя" name={deal.buyReceipt} onChange={e => handleReceiptUpload('buyReceipt', e)} />
            <ReceiptBtn label="Чек продавца" name={deal.sellReceipt} onChange={e => handleReceiptUpload('sellReceipt', e)} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1.5 px-3 pb-2.5">
        <button
          onClick={() => onComplete(deal.id)}
          className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
        >
          <Check size={12} /> Завершить
        </button>
        <button
          onClick={() => onCancel(deal.id)}
          className="flex-1 bg-[#0d1117] hover:bg-red-500/10 text-[#8b949e] hover:text-red-400 text-xs py-1.5 rounded border border-[#30363d] hover:border-red-500/30 flex items-center justify-center gap-1 transition-colors"
        >
          <X size={12} /> Отменить
        </button>
      </div>
    </div>
  );
}

function AmtBadge({ label, value, color }) {
  const colors = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    muted: 'text-[#8b949e]',
  };
  return (
    <div className="text-center">
      <div className="text-[10px] text-[#8b949e] leading-none mb-0.5">{label}</div>
      <div className={`mono font-medium text-xs ${colors[color]}`}>{value} ₽</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex gap-1 items-baseline">
      <span className="text-[#8b949e] shrink-0">{label}:</span>
      <span className="text-[#c9d1d9] mono break-all">{value}</span>
    </div>
  );
}

function ReceiptBtn({ label, name, onChange }) {
  return (
    <label className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded border border-dashed border-[#30363d] hover:border-blue-500/40 cursor-pointer transition-colors text-xs text-[#8b949e] hover:text-blue-400">
      <input type="file" accept=".pdf,image/*" onChange={onChange} className="hidden" />
      {name ? <FileText size={11} className="text-blue-400 shrink-0" /> : <Upload size={11} className="shrink-0" />}
      <span className="truncate">{name || label}</span>
    </label>
  );
}
