import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import DealCard from './DealCard';
import { calcRouteMath, fmt } from '../utils/calculations';

export default function DealsJournal({ routes, archived, cards, onComplete, onCancel, onUpdate, onNewDeal }) {
  const [showArchive, setShowArchive] = useState(false);

  return (
    <div className="space-y-4">
      {/* Active */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e] uppercase tracking-wider font-medium">Активные маршруты выплат</span>
            {routes.length > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded mono">{routes.length}</span>
            )}
          </div>
          <button onClick={onNewDeal} className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1 transition-colors">
            <Plus size={13} /> Новая выплата
          </button>
        </div>

        {routes.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg py-8 text-center text-sm text-[#8b949e]">
            Нет активных маршрутов
          </div>
        ) : (
          <div className="space-y-2">
            {routes.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                cards={cards}
                onComplete={onComplete}
                onCancel={onCancel}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archive toggle */}
      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchive(v => !v)}
            className="flex items-center gap-2 text-xs text-[#8b949e] hover:text-[#c9d1d9] transition-colors w-full"
          >
            <span className="uppercase tracking-wider font-medium">Архив</span>
            <span className="mono text-[#484f58]">{archived.length}</span>
            <div className="flex-1 h-px bg-[#30363d] ml-1" />
            {showArchive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showArchive && (
            <div className="mt-2 space-y-1 fade-in">
              {[...archived].reverse().map((deal, i) => (
                <ArchiveRow key={deal.id + deal.closedAt + i} deal={deal} cards={cards} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArchiveRow({ deal, cards }) {
  const [open, setOpen] = useState(false);
  const math = calcRouteMath(deal);
  const pnl = math.pnl;
  const card = cards.find(c => c.id === deal.topUpCardId);
  const done = deal.status === 'completed';
  const time = deal.closedAt ? new Date(deal.closedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="text-[#8b949e] mono">#{deal.id}</span>
        <span className={done ? 'text-emerald-400' : 'text-red-400'}>{done ? 'Завершена' : 'Отменена'}</span>
        <span className="text-[#484f58] mono">входы {fmt(math.totalInputAmount)} → выплата {fmt(deal.amount)} ₽</span>
        {done && (
          <span className={`mono font-medium ml-auto ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{fmt(pnl, 2)} ₽
          </span>
        )}
        <span className="text-[#484f58] hidden sm:inline">{time}</span>
        <button onClick={() => setOpen(v => !v)} className="text-[#484f58] hover:text-[#8b949e] ml-auto sm:ml-0 transition-colors">
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {open && (
        <div className="mt-2 pt-2 border-t border-[#30363d] grid grid-cols-2 sm:grid-cols-4 gap-2 fade-in">
          <MiniRow label="Банк продавца" value={deal.sellerBank} />
          <MiniRow label="Карта продавца" value={deal.sellerCard} />
          <MiniRow label="Крипта входов" value={`${math.totalInputCrypto.toFixed(6)} USDT`} />
          <MiniRow label="Крипта выплаты" value={`${math.payoutCrypto.toFixed(6)} USDT`} />
          <MiniRow label="Остаток" value={`${fmt(math.remaining, 2)} ₽`} />
          <MiniRow label="Карта доплаты" value={card ? `${card.bankName} ••${card.lastFour}` : '—'} />
        </div>
      )}
    </div>
  );
}

function MiniRow({ label, value }) {
  return (
    <div>
      <div className="text-[#484f58]">{label}</div>
      <div className="text-[#8b949e] mono break-all">{value}</div>
    </div>
  );
}
