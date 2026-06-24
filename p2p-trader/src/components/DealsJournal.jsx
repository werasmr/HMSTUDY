import { Layers, Plus, Archive, TrendingDown } from 'lucide-react';
import DealCard from './DealCard';
import ArchivedDeal from './ArchivedDeal';

export default function DealsJournal({ deals, archivedDeals, cards, onComplete, onCancel, onNewDeal }) {
  const activeDeals = deals.filter(d => d.status === 'active');

  return (
    <div className="space-y-5">
      {/* Active deals */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            <h2 className="section-header">Активные сделки</h2>
            {activeDeals.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                {activeDeals.length}
              </span>
            )}
          </div>
          <button onClick={onNewDeal} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={14} />
            Новая сделка
          </button>
        </div>

        {activeDeals.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Layers size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Нет активных сделок</p>
            <p className="text-xs mt-1 text-gray-700">Нажмите «Новая сделка» чтобы начать</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {activeDeals.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                cards={cards}
                onComplete={onComplete}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archive */}
      {archivedDeals.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Archive size={16} className="text-gray-400" />
            <h2 className="section-header">Архив сделок</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 font-medium">
              {archivedDeals.length}
            </span>
          </div>
          <div className="space-y-2">
            {[...archivedDeals].reverse().map(deal => (
              <ArchivedDeal key={deal.id + deal.closedAt} deal={deal} cards={cards} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
