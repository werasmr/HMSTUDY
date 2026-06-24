import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { generateId, payoutCrypto } from '../utils/calculations';

const EMPTY = {
  amount: '',
  rate: '',
  reward: '0',
  sellerBank: '',
  sellerCard: '',
};

export default function DealForm({ onClose, onSubmit }) {
  const [f, setF] = useState(EMPTY);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const crypto = payoutCrypto(f);

  function submit(e) {
    e.preventDefault();
    const now = Date.now();
    onSubmit({
      id: 'RT' + generateId().slice(0, 6),
      createdAt: now,
      status: 'active',
      amount: f.amount,
      rate: f.rate,
      reward: f.reward,
      sellerBank: f.sellerBank,
      sellerCard: f.sellerCard,
      topUpCardId: '',
      inputs: [],
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Send size={15} className="text-orange-400" />
            <span className="text-sm font-medium text-white">Новая Выплата</span>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Row label="Сумма выплаты ₽" type="number" value={f.amount} onChange={v => set('amount', v)} placeholder="50000" required />
            <Row label="Курс выплаты" type="number" value={f.rate} onChange={v => set('rate', v)} placeholder="91.20" step="0.01" required />
          </div>
          <Row label="Награда выплаты %" type="number" value={f.reward} onChange={v => set('reward', v)} placeholder="0 или -1.5" step="0.1" />

          <div className="border-t border-[#30363d] pt-4 space-y-3">
            <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider">Реквизиты продавца крипты</div>
            <Row label="Банк получателя" value={f.sellerBank} onChange={v => set('sellerBank', v)} placeholder="Тинькофф" required />
            <Row label="Номер карты получателя" value={f.sellerCard} onChange={v => set('sellerCard', v)} placeholder="5536 9134 0022 3312" required mono />
          </div>

          {(f.amount || f.rate) && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <div className="text-xs text-[#8b949e] mb-1">Крипта выплаты</div>
              <div className="text-lg font-bold mono text-white">{crypto.toFixed(6)} USDT</div>
              <div className="text-[11px] text-[#484f58] mt-1">
                Сумма × (1 + награда / 100) / курс
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            Создать выплату
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
