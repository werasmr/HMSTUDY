import { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { formatMoney } from '../utils/calculations';

const BANK_COLORS = {
  green: { bg: 'from-emerald-600 to-emerald-800', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' },
  yellow: { bg: 'from-amber-500 to-amber-700', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
  red: { bg: 'from-red-600 to-red-800', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-300' },
  blue: { bg: 'from-blue-600 to-blue-800', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
  purple: { bg: 'from-purple-600 to-purple-800', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
  cyan: { bg: 'from-cyan-600 to-cyan-800', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20 text-cyan-300' },
};

export default function CardsPanel({ cards, onAddCard, onUpdateCard, onDeleteCard }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ bankName: '', lastFour: '', balance: '', color: 'blue' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.bankName || !form.lastFour || !form.balance) return;
    onAddCard({
      bankName: form.bankName,
      lastFour: form.lastFour,
      balance: parseFloat(form.balance),
      color: form.color,
    });
    setForm({ bankName: '', lastFour: '', balance: '', color: 'blue' });
    setShowAddForm(false);
  };

  const handleEditSave = (card) => {
    onUpdateCard(editingId, card);
    setEditingId(null);
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-blue-400" />
          <h2 className="section-header">Мои карты</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-ghost text-xs py-1.5 px-3"
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 rounded-lg bg-dark-700/50 border border-dark-400/50 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Банк</label>
              <input
                type="text"
                placeholder="Сбербанк"
                value={form.bankName}
                onChange={e => setForm({ ...form, bankName: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label-text">4 цифры карты</label>
              <input
                type="text"
                placeholder="1234"
                maxLength={4}
                value={form.lastFour}
                onChange={e => setForm({ ...form, lastFour: e.target.value.replace(/\D/g, '') })}
                className="input-field text-sm font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Баланс (₽)</label>
              <input
                type="number"
                placeholder="100000"
                value={form.balance}
                onChange={e => setForm({ ...form, balance: e.target.value })}
                className="input-field text-sm font-mono"
              />
            </div>
            <div>
              <label className="label-text">Цвет</label>
              <select
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="input-field text-sm"
              >
                <option value="blue">Синий</option>
                <option value="green">Зелёный</option>
                <option value="yellow">Жёлтый</option>
                <option value="red">Красный</option>
                <option value="purple">Фиолетовый</option>
                <option value="cyan">Голубой</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-success text-xs py-1.5 px-3 flex-1">
              <Check size={13} /> Сохранить
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-ghost text-xs py-1.5 px-3">
              <X size={13} /> Отмена
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {cards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            isEditing={editingId === card.id}
            onEdit={() => setEditingId(card.id)}
            onSave={handleEditSave}
            onCancelEdit={() => setEditingId(null)}
            onDelete={() => onDeleteCard(card.id)}
          />
        ))}
      </div>

      {cards.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-600">
          <CreditCard size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Добавьте рабочие карты</p>
        </div>
      )}
    </div>
  );
}

function CardItem({ card, isEditing, onEdit, onSave, onCancelEdit, onDelete }) {
  const [editBalance, setEditBalance] = useState(card.balance.toString());
  const colors = BANK_COLORS[card.color] || BANK_COLORS.blue;

  const handleSave = () => {
    onSave({ ...card, balance: parseFloat(editBalance) || card.balance });
  };

  if (isEditing) {
    return (
      <div className={`rounded-xl p-3 bg-dark-700 border ${colors.border} animate-fade-in`}>
        <div className="text-xs text-gray-400 mb-2">{card.bankName} •••• {card.lastFour}</div>
        <input
          type="number"
          value={editBalance}
          onChange={e => setEditBalance(e.target.value)}
          className="input-field text-sm font-mono mb-2"
          autoFocus
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="btn-success text-xs py-1 px-2 flex-1">
            <Check size={12} /> OK
          </button>
          <button onClick={onCancelEdit} className="btn-ghost text-xs py-1 px-2">
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border ${colors.border} group`}>
      <div className={`bg-gradient-to-br ${colors.bg} p-3 pb-2`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-white/90 text-xs font-medium">{card.bankName}</div>
            <div className="text-white/60 text-xs font-mono mt-0.5">•••• •••• •••• {card.lastFour}</div>
          </div>
          <CreditCard size={16} className="text-white/40" />
        </div>
      </div>
      <div className="bg-dark-700/80 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-xs">Баланс</div>
            <div className="text-white font-semibold font-mono text-sm">
              {formatMoney(card.balance)} ₽
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={onDelete}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
