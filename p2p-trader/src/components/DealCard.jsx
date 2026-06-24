import { useState } from 'react';
import { Check, X, Plus, Upload, Loader2, AlertCircle, CheckCircle2, ArrowDown, CreditCard } from 'lucide-react';
import { calcRouteMath, fmt, generateId, inputDollar, outputDollar } from '../utils/calculations';
import { verifyReceiptAmount } from '../utils/pdfReceipt';

export default function DealCard({ deal, cards, onComplete, onCancel, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ amount: '', rate: '', reward: '0', buyerName: '' });
  const [parsingId, setParsingId] = useState(null);
  const math = calcRouteMath(deal);
  const req = `${deal.sellerBank} • ${deal.sellerCard}`;
  const topUpCard = cards.find(card => card.id === deal.topUpCardId);

  function addInput(e) {
    e.preventDefault();
    if (!draft.amount || !draft.rate) return;
    const nextInput = {
      id: 'IN' + generateId().slice(0, 5),
      amount: draft.amount,
      rate: draft.rate,
      reward: draft.reward,
      buyerName: draft.buyerName,
      receipt: null,
    };
    onUpdate(deal.id, { inputs: [...(deal.inputs ?? []), nextInput] });
    setDraft({ amount: '', rate: '', reward: '0', buyerName: '' });
    setAdding(false);
  }

  function updateInput(inputId, patch) {
    onUpdate(deal.id, {
      inputs: (deal.inputs ?? []).map(input => input.id === inputId ? { ...input, ...patch } : input),
    });
  }

  function deleteInput(inputId) {
    onUpdate(deal.id, {
      inputs: (deal.inputs ?? []).filter(input => input.id !== inputId),
    });
  }

  async function uploadReceipt(input, file) {
    if (!file) return;
    setParsingId(input.id);
    updateInput(input.id, {
      receipt: { status: 'parsing', fileName: file.name },
    });
    try {
      const result = await verifyReceiptAmount(file, input.amount);
      updateInput(input.id, {
        receipt: {
          status: result.ok ? 'matched' : 'mismatch',
          fileName: result.fileName,
          matchedVariant: result.matchedVariant,
          textPreview: result.textPreview,
        },
      });
    } catch (error) {
      updateInput(input.id, {
        receipt: {
          status: 'error',
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Не удалось прочитать PDF',
        },
      });
    } finally {
      setParsingId(null);
    }
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden fade-in">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e] mono">#{deal.id}</span>
            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-semibold uppercase">Выплата</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#8b949e] uppercase tracking-wider">Общая прибыль</div>
            <div className={`text-3xl font-black mono ${math.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {math.totalProfit >= 0 ? '+' : ''}{fmt(math.totalProfit, 2)} ₽
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric label="Сумма выплаты" value={`${fmt(deal.amount)} ₽`} tone="orange" />
          <Metric label="Курс выплаты" value={`${fmt(deal.rate, 2)} ₽`} />
          <Metric label="Выход в долларах" value={`${outputDollar(deal).toFixed(4)} $`} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric
            label="Остаток в долларах"
            value={`${math.remainingDollar > 0 ? '' : '+'}${Math.abs(math.remainingDollar).toFixed(4)} $`}
            tone={math.remainingDollar > 0 ? 'amber' : 'emerald'}
            large
          />
          <Metric
            label="Общая прибыль в рублях"
            value={`${math.totalProfit >= 0 ? '+' : ''}${fmt(math.totalProfit, 2)} ₽`}
            tone={math.totalProfit >= 0 ? 'emerald' : 'red'}
            large
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-1">Инструкция для покупателя</div>
          <div className="text-lg md:text-xl font-black text-white">
            Перевод на <span className="text-blue-300">{req}</span>
          </div>
          <div className="text-xs text-[#8b949e] mt-1">Все привязанные входы используют эти реквизиты автоматически.</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric label="Входы всего" value={`${fmt(math.totalInputAmount)} ₽`} tone="emerald" />
          <Metric label="Входы в долларах" value={`${math.totalInputDollar.toFixed(4)} $`} tone="emerald" />
          <Metric label="Профит входов" value={`${math.inputRewardProfit >= 0 ? '+' : ''}${fmt(math.inputRewardProfit, 2)} ₽`} tone={math.inputRewardProfit >= 0 ? 'emerald' : 'red'} />
        </div>

        {math.remainingDollar > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm mb-2">
              <CreditCard size={15} />
              Необходимо доплатить с моей карты: <span className="mono">{fmt(math.topUpRub, 2)} рублей</span>
            </div>
            <select
              value={deal.topUpCardId}
              onChange={e => onUpdate(deal.id, { topUpCardId: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-amber-500"
            >
              <option value="">— Выберите личную карту для списания при завершении —</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.bankName} ••{card.lastFour} ({fmt(card.balance)} ₽)
                </option>
              ))}
            </select>
            {topUpCard && (
              <div className="text-xs text-[#8b949e] mt-2">
                После завершения с карты {topUpCard.bankName} будет списано {fmt(math.topUpRub, 2)} ₽.
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Привязанные входы</div>
            <button
              onClick={() => setAdding(value => !value)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <Plus size={13} /> Привязать Вход
            </button>
          </div>

          {adding && (
            <form onSubmit={addInput} className="grid grid-cols-12 gap-2 bg-[#0d1117] border border-[#30363d] rounded-xl p-3 fade-in">
              <SmallInput className="col-span-3" label="Сумма" type="number" value={draft.amount} onChange={v => setDraft(p => ({ ...p, amount: v }))} placeholder="27000" required />
              <SmallInput className="col-span-3" label="Курс" type="number" value={draft.rate} onChange={v => setDraft(p => ({ ...p, rate: v }))} placeholder="92.50" required />
              <SmallInput className="col-span-2" label="%" type="number" value={draft.reward} onChange={v => setDraft(p => ({ ...p, reward: v }))} placeholder="1" />
              <SmallInput className="col-span-3" label="Покупатель" value={draft.buyerName} onChange={v => setDraft(p => ({ ...p, buyerName: v }))} placeholder="Иванов" />
              <button className="col-span-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white flex items-center justify-center transition-colors" title="Добавить вход">
                <Check size={15} />
              </button>
            </form>
          )}

          {(deal.inputs ?? []).length === 0 ? (
            <div className="bg-[#0d1117] border border-dashed border-[#30363d] rounded-xl p-5 text-center text-sm text-[#8b949e]">
              Пока нет входов. Нажмите «+ Привязать Вход».
            </div>
          ) : (
            <div className="space-y-2">
              {(deal.inputs ?? []).map((input, index) => (
                <InputRow
                  key={input.id}
                  input={input}
                  index={index}
                  parsing={parsingId === input.id}
                  onDelete={() => deleteInput(input.id)}
                  onUpload={file => uploadReceipt(input, file)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onComplete(deal.id)}
            disabled={math.remainingDollar > 0 && !deal.topUpCardId}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-[#30363d] disabled:text-[#8b949e] text-white text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors"
          >
            <Check size={15} /> Завершить маршрут
          </button>
          <button
            onClick={() => onCancel(deal.id)}
            className="px-4 bg-transparent hover:bg-red-500/10 text-[#8b949e] hover:text-red-400 text-sm py-2.5 rounded-lg border border-[#30363d] hover:border-red-500/30 flex items-center justify-center gap-2 transition-colors"
          >
            <X size={15} /> Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone = 'default', large = false }) {
  const colors = {
    default: 'text-white',
    orange: 'text-orange-300',
    emerald: 'text-emerald-400',
    amber: 'text-amber-300',
    red: 'text-red-400',
  };
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3">
      <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">{label}</div>
      <div className={`${large ? 'text-2xl' : 'text-lg'} font-black mono ${colors[tone]}`}>{value}</div>
    </div>
  );
}

function SmallInput({ className, label, value, onChange, ...props }) {
  return (
    <label className={className}>
      <span className="block text-[10px] text-[#8b949e] mb-1 uppercase tracking-wider">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs mono text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-emerald-500"
        {...props}
      />
    </label>
  );
}

function InputRow({ input, index, parsing, onDelete, onUpload }) {
  const dollar = inputDollar(input);
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs mono shrink-0">
          {index + 1}
        </div>
        <div className="grid grid-cols-4 gap-3 flex-1">
          <Cell label="Сумма" value={`${fmt(input.amount)} ₽`} strong />
          <Cell label="Курс" value={`${fmt(input.rate, 2)} ₽`} />
          <Cell label="Награда" value={`${input.reward || 0}%`} />
          <Cell label="Вход $" value={`${dollar.toFixed(4)} $`} strong tone="emerald" />
        </div>
        <label className="shrink-0 cursor-pointer">
          <input type="file" accept="application/pdf,.pdf" onChange={e => onUpload(e.target.files?.[0])} className="hidden" />
          <ReceiptStatus receipt={input.receipt} parsing={parsing} />
        </label>
        <button onClick={onDelete} className="text-[#484f58] hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-[#8b949e]">
        <ArrowDown size={12} className="text-blue-400" />
        Инструкция для покупателя уже задана родительской выплатой. {input.buyerName && <span className="mono">Покупатель: {input.buyerName}</span>}
      </div>
    </div>
  );
}

function Cell({ label, value, strong, tone = 'default' }) {
  const toneClass = tone === 'emerald' ? 'text-emerald-400' : 'text-white';
  return (
    <div>
      <div className="text-[10px] text-[#8b949e] uppercase tracking-wider">{label}</div>
      <div className={`mono ${strong ? 'font-black text-sm' : 'font-medium text-xs text-[#c9d1d9]'} ${strong ? toneClass : ''}`}>
        {value}
      </div>
    </div>
  );
}

function ReceiptStatus({ receipt, parsing }) {
  if (parsing || receipt?.status === 'parsing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs">
        <Loader2 size={12} className="animate-spin" /> PDF
      </span>
    );
  }
  if (receipt?.status === 'matched' || receipt?.status === 'demo') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs" title={receipt.fileName}>
        <CheckCircle2 size={12} /> Чек OK
      </span>
    );
  }
  if (receipt?.status === 'mismatch' || receipt?.status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/30 text-xs" title={receipt.error || receipt.textPreview}>
        <AlertCircle size={12} /> Не совпало
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-[#30363d] text-[#8b949e] hover:text-blue-300 hover:border-blue-500/40 text-xs transition-colors">
      <Upload size={12} /> PDF
    </span>
  );
}
