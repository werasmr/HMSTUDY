import { useState } from 'react';
import { X, Upload, Calculator, ArrowDownCircle, Send, ArrowUpCircle, Clock, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { calcDealMath, formatMoney, generateId } from '../utils/calculations';

const EMPTY_FORM = {
  timerMinutes: 10,
  stage1: {
    buyAmount: '',
    buyRate: '',
    buyReward: '',
    buyerRequisites: '',
    receiptName: null,
    receiptUrl: null,
  },
  stage2: {
    cardId: '',
    sendAmount: '',
  },
  stage3: {
    sellAmount: '',
    sellRate: '',
    sellReward: '',
    sellerRequisites: '',
    receiptName: null,
    receiptUrl: null,
  },
};

export default function DealForm({ cards, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const updateStage1 = (field, value) => setForm(f => ({ ...f, stage1: { ...f.stage1, [field]: value } }));
  const updateStage2 = (field, value) => setForm(f => ({ ...f, stage2: { ...f.stage2, [field]: value } }));
  const updateStage3 = (field, value) => setForm(f => ({ ...f, stage3: { ...f.stage3, [field]: value } }));

  const math = calcDealMath({
    buyAmount: form.stage1.buyAmount,
    buyRate: form.stage1.buyRate,
    buyReward: form.stage1.buyReward,
    sendAmount: form.stage2.sendAmount,
    sellAmount: form.stage3.sellAmount,
    sellRate: form.stage3.sellRate,
    sellReward: form.stage3.sellReward,
  });

  const handleReceiptUpload = (stage, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (stage === 1) {
      setForm(f => ({ ...f, stage1: { ...f.stage1, receiptName: file.name, receiptUrl: url } }));
    } else {
      setForm(f => ({ ...f, stage3: { ...f.stage3, receiptName: file.name, receiptUrl: url } }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = Date.now();
    const deal = {
      id: 'DM' + generateId().slice(0, 6),
      createdAt: now,
      timerMinutes: parseInt(form.timerMinutes),
      expiresAt: now + parseInt(form.timerMinutes) * 60 * 1000,
      expired: false,
      status: 'active',
      stage1: { ...form.stage1 },
      stage2: { ...form.stage2 },
      stage3: { ...form.stage3 },
    };
    onSubmit(deal);
    onClose();
  };

  const imbalanceNum = parseFloat(math.imbalance);
  const pnlNum = parseFloat(math.pnl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl border border-dark-400/60 shadow-2xl animate-slide-up">
        <div className="sticky top-0 glass border-b border-dark-400/50 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-blue-400" />
            <h2 className="text-white font-semibold">Создать сделку</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Stage 1 */}
          <StageBlock
            icon={<ArrowDownCircle size={16} className="text-emerald-400" />}
            title="Этап 1 — Приём от Покупателя"
            color="emerald"
          >
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Сумма приёма (₽)"
                type="number"
                placeholder="50000"
                value={form.stage1.buyAmount}
                onChange={v => updateStage1('buyAmount', v)}
                mono
              />
              <InputField
                label="Курс покупки (₽/USDT)"
                type="number"
                placeholder="92.50"
                value={form.stage1.buyRate}
                onChange={v => updateStage1('buyRate', v)}
                mono
              />
              <InputField
                label="Награда % (напр. +8 или -1.5)"
                type="number"
                placeholder="8"
                step="0.1"
                value={form.stage1.buyReward}
                onChange={v => updateStage1('buyReward', v)}
                mono
              />
              <div>
                <label className="label-text">Реквизиты покупателя</label>
                <input
                  type="text"
                  placeholder="ФИО | Банк | Номер карты"
                  value={form.stage1.buyerRequisites}
                  onChange={e => updateStage1('buyerRequisites', e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>
            <ReceiptUploader
              name={form.stage1.receiptName}
              onChange={e => handleReceiptUpload(1, e)}
            />
            {form.stage1.buyRate && form.stage1.buyAmount && (
              <div className="text-xs text-gray-400 mt-1 font-mono">
                Крипто: {math.cryptoBuyVolume} USDT · Эфф. курс: {formatMoney(math.effectiveBuyRate, 2)} ₽
              </div>
            )}
          </StageBlock>

          {/* Stage 2 */}
          <StageBlock
            icon={<Send size={16} className="text-blue-400" />}
            title="Этап 2 — Отправка с Моей карты"
            color="blue"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">Выберите карту</label>
                <select
                  value={form.stage2.cardId}
                  onChange={e => updateStage2('cardId', e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">— Выберите карту —</option>
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.bankName} •••• {c.lastFour} ({formatMoney(c.balance)} ₽)
                    </option>
                  ))}
                </select>
              </div>
              <InputField
                label="Сумма отправки (₽)"
                type="number"
                placeholder="50000"
                value={form.stage2.sendAmount}
                onChange={v => updateStage2('sendAmount', v)}
                mono
                required
              />
            </div>
          </StageBlock>

          {/* Stage 3 */}
          <StageBlock
            icon={<ArrowUpCircle size={16} className="text-orange-400" />}
            title="Этап 3 — Выплата Продавцу"
            color="orange"
          >
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Сумма выплаты (₽)"
                type="number"
                placeholder="49000"
                value={form.stage3.sellAmount}
                onChange={v => updateStage3('sellAmount', v)}
                mono
              />
              <InputField
                label="Курс продажи (₽/USDT)"
                type="number"
                placeholder="91.20"
                value={form.stage3.sellRate}
                onChange={v => updateStage3('sellRate', v)}
                mono
              />
              <InputField
                label="Награда % (напр. 0 или -2)"
                type="number"
                placeholder="0"
                step="0.1"
                value={form.stage3.sellReward}
                onChange={v => updateStage3('sellReward', v)}
                mono
              />
              <div>
                <label className="label-text">Реквизиты продавца</label>
                <input
                  type="text"
                  placeholder="ФИО | Банк | Номер карты"
                  value={form.stage3.sellerRequisites}
                  onChange={e => updateStage3('sellerRequisites', e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>
            <ReceiptUploader
              name={form.stage3.receiptName}
              onChange={e => handleReceiptUpload(3, e)}
            />
            {form.stage3.sellRate && form.stage3.sellAmount && (
              <div className="text-xs text-gray-400 mt-1 font-mono">
                Крипто: {math.cryptoSellVolume} USDT · Эфф. курс: {formatMoney(math.effectiveSellRate, 2)} ₽
              </div>
            )}
          </StageBlock>

          {/* Timer */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} className="text-purple-400" />
              <span className="section-header text-xs">Таймер сделки</span>
            </div>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map(min => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, timerMinutes: min }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.timerMinutes === min
                      ? 'bg-purple-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
                  }`}
                >
                  {min} мин
                </button>
              ))}
            </div>
          </div>

          {/* Math Summary */}
          {(form.stage1.buyAmount || form.stage2.sendAmount || form.stage3.sellAmount) && (
            <div className="glass-card rounded-xl p-4 space-y-2 border border-dark-400/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={15} className="text-blue-400" />
                <span className="section-header text-xs">Расчёт по сделке</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-gray-500 text-xs">Приём</div>
                  <div className="text-white font-mono font-medium">{formatMoney(form.stage1.buyAmount || 0)} ₽</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs">Отправка</div>
                  <div className="text-white font-mono font-medium">{formatMoney(form.stage2.sendAmount || 0)} ₽</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs">Выплата</div>
                  <div className="text-white font-mono font-medium">{formatMoney(form.stage3.sellAmount || 0)} ₽</div>
                </div>
              </div>
              <div className="border-t border-dark-400/50 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={13} className={imbalanceNum === 0 ? 'text-gray-500' : imbalanceNum > 0 ? 'text-emerald-400' : 'text-red-400'} />
                  <span className="text-gray-400 text-xs">Дисбаланс:</span>
                  <span className={`font-mono font-semibold text-sm ${imbalanceNum > 0 ? 'text-emerald-400' : imbalanceNum < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {imbalanceNum > 0 ? '+' : ''}{formatMoney(math.imbalance)} ₽
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className={pnlNum >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                  <span className="text-gray-400 text-xs">PnL:</span>
                  <span className={`font-mono font-semibold text-sm ${pnlNum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pnlNum >= 0 ? '+' : ''}{formatMoney(math.pnl)} ₽
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 justify-center py-3">
              <Calculator size={16} />
              Создать сделку
            </button>
            <button type="button" onClick={onClose} className="btn-ghost py-3 px-5">
              <X size={16} />
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StageBlock({ icon, title, color, children }) {
  const borderMap = {
    emerald: 'border-l-emerald-500/60',
    blue: 'border-l-blue-500/60',
    orange: 'border-l-orange-500/60',
  };
  return (
    <div className={`glass-card rounded-xl p-4 border-l-2 ${borderMap[color] || ''}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-gray-300 text-sm font-medium">{title}</span>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, type = 'text', placeholder, value, onChange, mono, step, required }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        step={step}
        onChange={e => onChange(e.target.value)}
        required={required}
        className={`input-field text-sm ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}

function ReceiptUploader({ name, onChange }) {
  return (
    <div className="mt-2">
      <label className="flex items-center gap-2 cursor-pointer group">
        <input type="file" accept=".pdf,image/*" onChange={onChange} className="hidden" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-dark-400 hover:border-blue-500/50 text-gray-500 group-hover:text-blue-400 transition-all text-xs">
          {name ? <FileText size={13} /> : <Upload size={13} />}
          {name ? <span className="text-blue-400 truncate max-w-xs">{name}</span> : <span>Загрузить чек (PDF/фото)</span>}
        </div>
      </label>
    </div>
  );
}
