import { useState } from 'react';
import { Plus, X, Check, Pencil, Trash2 } from 'lucide-react';
import { fmt } from '../utils/calculations';

const COLORS = {
  green:  'border-emerald-500/40 text-emerald-400',
  yellow: 'border-amber-500/40   text-amber-400',
  red:    'border-red-500/40     text-red-400',
  blue:   'border-blue-500/40   text-blue-400',
  purple: 'border-purple-500/40  text-purple-400',
};

export default function CardsPanel({ cards, onAdd, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ bankName: '', lastFour: '', balance: '', color: 'blue' });

  function submitAdd(e) {
    e.preventDefault();
    if (!form.bankName || !form.lastFour || !form.balance) return;
    onAdd({ bankName: form.bankName, lastFour: form.lastFour, balance: parseFloat(form.balance), color: form.color });
    setForm({ bankName: '', lastFour: '', balance: '', color: 'blue' });
    setAdding(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8b949e] uppercase tracking-wider font-medium">Мои карты</span>
        <button onClick={() => setAdding(v => !v)} className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1 transition-colors">
          <Plus size={13} /> Добавить
        </button>
      </div>

      {adding && (
        <form onSubmit={submitAdd} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 space-y-2 fade-in">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Банк" value={form.bankName} onChange={v => setForm(f => ({ ...f, bankName: v }))} placeholder="Сбербанк" />
            <Field label="4 цифры" value={form.lastFour} onChange={v => setForm(f => ({ ...f, lastFour: v.replace(/\D/g, '').slice(0, 4) }))} placeholder="1234" mono />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Баланс ₽" type="number" value={form.balance} onChange={v => setForm(f => ({ ...f, balance: v }))} placeholder="100000" mono />
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Цвет</label>
              <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#c9d1d9] focus:outline-none focus:border-blue-500">
                <option value="blue">Синий</option>
                <option value="green">Зелёный</option>
                <option value="yellow">Жёлтый</option>
                <option value="red">Красный</option>
                <option value="purple">Фиолетовый</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-colors">
              <Check size={12} /> Сохранить
            </button>
            <button type="button" onClick={() => setAdding(false)} className="px-3 text-xs text-[#8b949e] hover:text-white border border-[#30363d] rounded transition-colors">
              <X size={12} />
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {cards.map(card => (
          <CardChip
            key={card.id}
            card={card}
            editing={editId === card.id}
            onEdit={() => setEditId(card.id)}
            onSave={(bal) => { onUpdate(card.id, { balance: bal }); setEditId(null); }}
            onCancelEdit={() => setEditId(null)}
            onDelete={() => onDelete(card.id)}
          />
        ))}
        {cards.length === 0 && !adding && (
          <span className="text-xs text-[#8b949e] py-2">Нет карт</span>
        )}
      </div>
    </div>
  );
}

function CardChip({ card, editing, onEdit, onSave, onCancelEdit, onDelete }) {
  const [bal, setBal] = useState(String(card.balance));
  const color = COLORS[card.color] || COLORS.blue;

  if (editing) {
    return (
      <div className="shrink-0 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 fade-in min-w-[160px]">
        <div className="text-xs text-[#8b949e] mb-1">{card.bankName} ••{card.lastFour}</div>
        <input
          type="number"
          value={bal}
          onChange={e => setBal(e.target.value)}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm mono text-white focus:outline-none focus:border-blue-500 mb-1.5"
          autoFocus
        />
        <div className="flex gap-1">
          <button onClick={() => onSave(parseFloat(bal) || 0)} className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs py-1 rounded flex items-center justify-center gap-1">
            <Check size={11} />
          </button>
          <button onClick={onCancelEdit} className="px-2 text-[#8b949e] hover:text-white border border-[#30363d] rounded text-xs">
            <X size={11} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group shrink-0 bg-[#161b22] border rounded-lg px-3 py-2 min-w-[150px] ${color.split(' ')[0]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#8b949e]">{card.bankName}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-[#8b949e] hover:text-white transition-colors"><Pencil size={11} /></button>
          <button onClick={onDelete} className="text-[#8b949e] hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
        </div>
      </div>
      <div className={`text-sm font-semibold mono ${color.split(' ')[1]}`}>{fmt(card.balance)} ₽</div>
      <div className="text-xs text-[#8b949e] mono">•••• {card.lastFour}</div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="block text-xs text-[#8b949e] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-blue-500 ${mono ? 'mono' : ''}`}
      />
    </div>
  );
}
