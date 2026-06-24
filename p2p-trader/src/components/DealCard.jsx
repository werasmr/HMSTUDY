import { useState, useEffect, useRef } from 'react';
import { Check, X, ChevronDown, ChevronUp, Upload, FileText, ArrowRight } from 'lucide-react';
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
  const buf = parseFloat(math.buffer);
  const pnl = parseFloat(math.pnl);
  const expired = timeLeft === 0;
  const critical = !expired && timeLeft < 60000;
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const timer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const pct = Math.max(0, (timeLeft / (deal.timerMinutes * 60000)) * 100);
  const card = cards.find(c => c.id === deal.cardId);

  function uploadReceipt(type, e) {
    const file = e.target.files?.[0];
    if (file) onUpdate(deal.id, { [type]: file.name });
  }

  return (
    <div className={`bg-[#161b22] border rounded-lg overflow-hidden fade-in ${
      expired ? 'border-red-500/50' : critical ? 'border-amber-500/40' : 'border-[#30363d]'
    }`}>
      {/* Timer progress bar */}
      <div className="h-[2px] bg-[#21262d]">
        <div
          className={`h-full transition-all duration-1000 ${expired ? 'bg-red-500' : critical ? 'bg-amber-400' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="p-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e] mono">#{deal.id}</span>
            {expired && (
              <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">ИСТЕКЛО</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`mono text-sm font-semibold tabular-nums ${
              expired ? 'text-red-400 timer-blink' : critical ? 'text-amber-400' : 'text-[#8b949e]'
            }`}>{timer}</span>
            <button onClick={() => setOpen(v => !v)} className="text-[#484f58] hover:text-[#8b949e] transition-colors">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* ── AMOUNT FLOW: Приём → Моя Карта → Выплата ── */}
        <div className="flex items-center gap-2 mb-3">
          {/* Приём */}
          <div className="flex-1 text-center">
            <div className="text-[10px] text-emerald-500/80 uppercase tracking-wider mb-0.5">Приём</div>
            <div className="text-xl font-bold text-white leading-none mono">
              {fmt(deal.buyAmount)}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">₽</div>
          </div>

          <ArrowRight size={14} className="text-[#484f58] shrink-0 mt-1" />

          {/* Моя карта */}
          <div className="flex-1 text-center">
            <div className="text-[10px] text-blue-400/80 uppercase tracking-wider mb-0.5">
              {card ? `${card.bankName} ••${card.lastFour}` : 'Моя карта'}
            </div>
            <div className={`text-xl font-bold leading-none mono ${deal.sendAmount ? 'text-white' : 'text-[#484f58]'}`}>
              {deal.sendAmount ? fmt(deal.sendAmount) : '—'}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">₽</div>
          </div>

          <ArrowRight size={14} className="text-[#484f58] shrink-0 mt-1" />

          {/* Выплата */}
          <div className="flex-1 text-center">
            <div className="text-[10px] text-orange-400/80 uppercase tracking-wider mb-0.5">Выплата</div>
            <div className="text-xl font-bold text-white leading-none mono">
              {fmt(deal.sellAmount)}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">₽</div>
          </div>
        </div>

        {/* Buffer + PnL */}
        <div className="flex items-center justify-between text-xs border-t border-[#21262d] pt-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8b949e]">Буфер:</span>
            <span className={`mono font-semibold ${buf > 0 ? 'text-emerald-400' : buf < 0 ? 'text-red-400' : 'text-[#8b949e]'}`}>
              {buf > 0 ? '+' : ''}{fmt(math.buffer, 2)} ₽
            </span>
            <span className="text-[#484f58] text-[10px]">(приём − отправка)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#8b949e]">PnL:</span>
            <span className={`mono font-bold text-sm ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pnl >= 0 ? '+' : ''}{fmt(math.pnl, 2)} ₽
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onComplete(deal.id)}
            className="flex-1 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs py-2 rounded-md flex items-center justify-center gap-1.5 font-medium transition-colors"
          >
            <Check size={13} /> Завершить
          </button>
          <button
            onClick={() => onCancel(deal.id)}
            className="flex-1 bg-transparent hover:bg-red-500/10 text-[#8b949e] hover:text-red-400 text-xs py-2 rounded-md border border-[#30363d] hover:border-red-500/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <X size={13} /> Отменить
          </button>
        </div>
      </div>

      {/* Expanded section */}
      {open && (
        <div className="border-t border-[#21262d] p-3 space-y-3 fade-in">

          {/* Fill in send */}
          <div>
            <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1.5">Отправка с моей карты</div>
            <div className="flex gap-2">
              <select
                value={deal.cardId}
                onChange={e => onUpdate(deal.id, { cardId: e.target.value })}
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-sm text-[#c9d1d9] focus:outline-none focus:border-blue-500"
              >
                <option value="">— Выберите карту —</option>
                {cards.map(c => (
                  <option key={c.id} value={c.id}>{c.bankName} ••{c.lastFour} ({fmt(c.balance)} ₽)</option>
                ))}
              </select>
              <input
                type="number"
                value={deal.sendAmount}
                onChange={e => onUpdate(deal.id, { sendAmount: e.target.value })}
                placeholder="Сумма ₽"
                className="w-28 bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-sm mono text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5">
              <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider font-semibold">Покупатель</div>
              {deal.buyRate    && <Row label="Курс"    value={`${fmt(deal.buyRate, 2)} ₽/USDT`} />}
              {deal.buyReward  && <Row label="Награда" value={`${deal.buyReward}%`} />}
              <Row label="Объём" value={`${math.cryptoBuy} USDT`} />
              <Row label="Эфф. курс" value={`${fmt(math.effBuyRate, 2)} ₽`} />
              {deal.buyerReq   && <Row label="Реквизиты" value={deal.buyerReq} />}
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] text-orange-400/70 uppercase tracking-wider font-semibold">Продавец</div>
              {deal.sellRate   && <Row label="Курс"    value={`${fmt(deal.sellRate, 2)} ₽/USDT`} />}
              {deal.sellReward && <Row label="Награда" value={`${deal.sellReward}%`} />}
              <Row label="Объём" value={`${math.cryptoSell} USDT`} />
              <Row label="Эфф. курс" value={`${fmt(math.effSellRate, 2)} ₽`} />
              {deal.sellerReq  && <Row label="Реквизиты" value={deal.sellerReq} />}
            </div>
          </div>

          {/* Receipts */}
          <div className="flex gap-2">
            <ReceiptBtn label="Чек покупателя" name={deal.buyReceipt} onChange={e => uploadReceipt('buyReceipt', e)} />
            <ReceiptBtn label="Чек продавца"   name={deal.sellReceipt} onChange={e => uploadReceipt('sellReceipt', e)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-1.5 items-baseline">
      <span className="text-[#484f58] shrink-0">{label}:</span>
      <span className="text-[#8b949e] mono break-all">{value}</span>
    </div>
  );
}

function ReceiptBtn({ label, name, onChange }) {
  return (
    <label className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dashed border-[#30363d] hover:border-blue-500/40 cursor-pointer transition-colors text-xs text-[#8b949e] hover:text-blue-400">
      <input type="file" accept=".pdf,image/*" onChange={onChange} className="hidden" />
      {name ? <FileText size={11} className="text-blue-400 shrink-0" /> : <Upload size={11} className="shrink-0" />}
      <span className="truncate">{name || label}</span>
    </label>
  );
}
