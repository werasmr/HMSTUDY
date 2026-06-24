import { useState, useEffect } from 'react';
import Header from './components/Header';
import CardsPanel from './components/CardsPanel';
import DealForm from './components/DealForm';
import DealsJournal from './components/DealsJournal';
import { storage } from './utils/storage';
import { generateId } from './utils/calculations';
import { DEMO_CARDS, DEMO_DEALS } from './utils/demoData';
import { requestNotificationPermission } from './utils/sound';

export default function App() {
  const [cards, setCards] = useState(() => storage.getCards() ?? DEMO_CARDS);
  const [deals, setDeals] = useState(() => storage.getDeals() ?? DEMO_DEALS);
  const [archived, setArchived] = useState(() => storage.getArchivedDeals());
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { storage.saveCards(cards); }, [cards]);
  useEffect(() => { storage.saveDeals(deals); }, [deals]);
  useEffect(() => { storage.saveArchivedDeals(archived); }, [archived]);
  useEffect(() => { requestNotificationPermission(); }, []);

  function addCard(data) {
    setCards(prev => [...prev, { id: 'c' + generateId(), ...data }]);
  }
  function updateCard(id, data) {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }
  function deleteCard(id) {
    setCards(prev => prev.filter(c => c.id !== id));
  }

  function addDeal(deal) {
    setDeals(prev => [...prev, deal]);
  }

  function updateDeal(id, patch) {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  }

  function completeDeal(dealId) {
    setDeals(prev => {
      const deal = prev.find(d => d.id === dealId);
      if (!deal) return prev;

      const send = parseFloat(deal.sendAmount) || 0;
      if (send > 0 && deal.cardId) {
        setCards(c => c.map(card =>
          card.id === deal.cardId
            ? { ...card, balance: Math.max(0, card.balance - send) }
            : card
        ));
      }

      setArchived(a => [...a, { ...deal, status: 'completed', closedAt: Date.now() }]);
      return prev.filter(d => d.id !== dealId);
    });
  }

  function cancelDeal(dealId) {
    setDeals(prev => {
      const deal = prev.find(d => d.id === dealId);
      if (!deal) return prev;
      setArchived(a => [...a, { ...deal, status: 'cancelled', closedAt: Date.now() }]);
      return prev.filter(d => d.id !== dealId);
    });
  }

  // PnL = buyAmount - sellAmount per completed deal today
  const stats = (() => {
    const today = new Date().toDateString();
    const todayDone = archived.filter(d =>
      d.status === 'completed' && new Date(d.closedAt).toDateString() === today
    );
    const pnl = todayDone.reduce((s, d) =>
      s + (parseFloat(d.buyAmount) || 0) - (parseFloat(d.sellAmount) || 0), 0
    );
    const volume = [...deals, ...archived].reduce((s, d) =>
      s + (parseFloat(d.buyAmount) || 0), 0
    );
    return { pnl, volume, active: deals.length, completed: todayDone.length };
  })();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <Header stats={stats} />
      <main className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        <CardsPanel cards={cards} onAdd={addCard} onUpdate={updateCard} onDelete={deleteCard} />
        <DealsJournal
          deals={deals}
          archived={archived}
          cards={cards}
          onComplete={completeDeal}
          onCancel={cancelDeal}
          onUpdate={updateDeal}
          onNewDeal={() => setShowForm(true)}
        />
      </main>
      {showForm && (
        <DealForm cards={cards} onClose={() => setShowForm(false)} onSubmit={addDeal} />
      )}
    </div>
  );
}
