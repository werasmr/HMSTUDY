import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { calcDealMath, fmt, generateId } from '../utils/calculations';

const EMPTY = {
  buyAmount: '', buyRate: '', buyReward: '', buyerReq: '',
  sellAmount: '', sellRate: '', sellReward: '', sellerReq: '',
  timerMinutes: 10,
};

export default function DealForm({ onClose, onSubmit }) {
  const [f, setF] = useState(EMPTY);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const math = calcDealMath({ ...f, sendAmount: '' });
  const pnl = parseFloat(math.pnl);

  function submit(e) {
    e.preventDefault();
    const now = Date.now();
    onSubmit({
      id: 'DM' + generateId().slice(0, 6),
      createdAt: now,
      timerMinutes: f.timerMinutes,
      expiresAt: now + f.timerMinutes * 60 * 1000,
      status: 'active',
      buyAmount: f.buyAmount,
      buyRate: f.buyRate,
      buyReward: f.buyReward,
      buyerReq: f.buyerReq,
      sellAmount: f.sellAmount,
      sellRate: f.sellRate,
      sellReward: f.sellReward,
      sellerReq: f.sellerReq,
      cardId: '',
      sendAmount: '',
      buyReceipt: null,
      sellReceipt: null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Plus size={15} className="text-blue-400" />
            <span className="text-sm font-medium text-white">Новая сделка</span>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Two columns: Buyer + Seller */}
          <div className="grid grid-cols-2 gap-4">
            {/* Buyer */}
            <div className="space-y-2">
              <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Покупатель</div>
              <Row label="Сумма ₽" type="number" value={f.buyAmount} onChange={v => set('buyAmount', v)} placeholder="52000" required />
              <Row label="Курс ₽/USDT" type="number" value={f.buyRate} onChange={v => set('buyRate', v)} placeholder="92.50" step="0.01" />
              <Row label="Награда %" type="number" value={f.buyReward} onChange={v => set('buyReward', v)} placeholder="+8 или -1.5" step="0.1" />
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Реквизиты</label>
                <textarea
                  value={f.buyerReq}
                  onChange={e => set('buyerReq', e.target.value)}
                  placeholder="ФИО | Банк | Карта"
                  rows={2}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              {f.buyRate && f.buyAmount && (
                <div className="text-xs text-[#8b949e] mono">{math.cryptoBuy} USDT · эфф. {fmt(math.effBuyRate, 2)} ₽</div>
              )}
            </div>

            {/* Seller */}
            <div className="space-y-2">
              <div className="text-xs text-orange-400 font-medium uppercase tracking-wider">Продавец</div>
              <Row label="Сумма ₽" type="number" value={f.sellAmount} onChange={v => set('sellAmount', v)} placeholder="50000" />
              <Row label="Курс ₽/USDT" type="number" value={f.sellRate} onChange={v => set('sellRate', v)} placeholder="91.20" step="0.01" />
              <Row label="Награда %" type="number" value={f.sellReward} onChange={v => set('sellReward', v)} placeholder="0 или -2" step="0.1" />
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Реквизиты</label>
                <textarea
                  value={f.sellerReq}
                  onChange={e => set('sellerReq', e.target.value)}
                  placeholder="ФИО | Банк | Карта"
                  rows={2}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              {f.sellRate && f.sellAmount && (
                <div className="text-xs text-[#8b949e] mono">{math.cryptoSell} USDT · эфф. {fmt(math.effSellRate, 2)} ₽</div>
              )}
            </div>
          </div>

          {/* Timer */}
          <div>
            <div className="text-xs text-[#8b949e] mb-1.5">Таймер</div>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('timerMinutes', m)}
                  className={`flex-1 py-1.5 rounded text-sm transition-colors ${
                    f.timerMinutes === m
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0d1117] border border-[#30363d] text-[#8b949e] hover:text-white'
                  }`}
                >
                  {m} мин
                </button>
              ))}
            </div>
          </div>

          {/* Math preview */}
          {(f.buyAmount || f.sellAmount) && (
            <div className="flex items-center gap-4 text-sm border-t border-[#30363d] pt-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[#8b949e]">PnL (спред):</span>
                <span className={`mono font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pnl >= 0 ? '+' : ''}{fmt(math.pnl, 2)} ₽
                </span>
              </div>
              <span className="text-[#484f58] text-xs">(приём − выплата)</span>
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            Создать сделку
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({ label, type = 'text', value, onChange, placeholder, step, required }) {
  return (
    <div>
      <label className="block text-xs text-[#8b949e] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        required={required}
        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm mono text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
