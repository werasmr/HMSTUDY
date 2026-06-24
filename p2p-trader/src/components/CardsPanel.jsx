import { useState } from 'react';
import { Plus, X, Check, Pencil, Trash2 } from 'lucide-react';
import { fmt } from '../utils/calculations';

const COLORS = {
  green:  { ring: 'border-emerald-500/40', val: 'text-emerald-400' },
  yellow: { ring: 'border-amber-500/40',   val: 'text-amber-400'   },
  red:    { ring: 'border-red-500/40',     val: 'text-red-400'     },
  blue:   { ring: 'border-blue-500/40',    val: 'text-blue-400'    },
  purple: { ring: 'border-purple-500/40',  val: 'text-purple-400'  },
};

export default function CardsPanel({ cards, onAdd, onUpdate, onDelete }) {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ bankName: '', lastFour: '', balance: '', color: 'blue' });

  function submitAdd(e) {
    e.preventDefault();
    if (!form.bankName || !form.lastFour || !form.balance) return;
    onAdd({ bankName: form.bankName, lastFour: form.lastFour, balance: parseFloat(form.balance), color: form.color });
    setForm({ bankName: '', lastFour: '', balance: '', color: 'blue' });
    setModal(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8b949e] uppercase tracking-wider font-medium">Мои карты</span>
        <button
          onClick={() => setModal(true)}
          className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1 transition-colors"
        >
          <Plus size={13} /> Добавить карту
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {cards.map(card => (
          <CardChip
            key={card.id}
            card={card}
            editing={editId === card.id}
            onEdit={() => setEditId(card.id)}
            onSave={bal => { onUpdate(card.id, { balance: bal }); setEditId(null); }}
            onCancelEdit={() => setEditId(null)}
            onDelete={() => onDelete(card.id)}
          />
        ))}
        {cards.length === 0 && (
          <span className="text-xs text-[#8b949e] py-2">Нет карт — нажмите «Добавить карту»</span>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 fade-in"
          onClick={e => e.target === e.currentTarget && setModal(false)}
        >
          <div className="w-full max-w-xs bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
              <span className="text-sm font-medium text-white">Новая карта</span>
              <button onClick={() => setModal(false)} className="text-[#8b949e] hover:text-white transition-colors">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={submitAdd} className="p-4 space-y-3">
              <Field label="Название банка" value={form.bankName} onChange={v => setForm(f => ({ ...f, bankName: v }))} placeholder="Сбербанк" />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Последние 4 цифры"
                  value={form.lastFour}
                  onChange={v => setForm(f => ({ ...f, lastFour: v.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="4821"
                  mono
                />
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1.5">Цвет</label>
                  <select
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-blue-500"
                  >
                    <option value="blue">Синий</option>
                    <option value="green">Зелёный</option>
                    <option value="yellow">Жёлтый</option>
                    <option value="red">Красный</option>
                    <option value="purple">Фиолетовый</option>
                  </select>
                </div>
              </div>
              <Field
                label="Текущий баланс (₽)"
                type="number"
                value={form.balance}
                onChange={v => setForm(f => ({ ...f, balance: v }))}
                placeholder="250000"
                mono
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Check size={14} /> Сохранить карту
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CardChip({ card, editing, onEdit, onSave, onCancelEdit, onDelete }) {
  const [bal, setBal] = useState(String(card.balance));
  const c = COLORS[card.color] || COLORS.blue;

  if (editing) {
    return (
      <div className="shrink-0 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 fade-in min-w-[160px]">
        <div className="text-xs text-[#8b949e] mb-1.5">{card.bankName} ••{card.lastFour}</div>
        <input
          type="number"
          value={bal}
          onChange={e => setBal(e.target.value)}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm mono text-white focus:outline-none focus:border-blue-500 mb-2"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && onSave(parseFloat(bal) || 0)}
        />
        <div className="flex gap-1.5">
          <button onClick={() => onSave(parseFloat(bal) || 0)} className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs py-1 rounded flex items-center justify-center gap-1 transition-colors">
            <Check size={11} /> OK
          </button>
          <button onClick={onCancelEdit} className="px-2 text-[#8b949e] hover:text-white border border-[#30363d] rounded text-xs transition-colors">
            <X size={11} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group shrink-0 bg-[#161b22] border ${c.ring} rounded-lg px-3 py-2.5 min-w-[150px]`}>
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-xs text-[#8b949e]">{card.bankName}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-[#8b949e] hover:text-white transition-colors"><Pencil size={11} /></button>
          <button onClick={onDelete} className="text-[#8b949e] hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
        </div>
      </div>
      <div className={`text-base font-bold mono ${c.val}`}>{fmt(card.balance)} ₽</div>
      <div className="text-xs text-[#484f58] mono mt-0.5">•••• {card.lastFour}</div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="block text-xs text-[#8b949e] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-blue-500 transition-colors ${mono ? 'mono' : ''}`}
      />
    </div>
  );
}
