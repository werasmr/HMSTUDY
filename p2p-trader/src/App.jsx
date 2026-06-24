import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CardsPanel from './components/CardsPanel';
import DealForm from './components/DealForm';
import DealsJournal from './components/DealsJournal';
import { storage } from './utils/storage';
import { calcDealMath, generateId } from './utils/calculations';
import { DEMO_CARDS, DEMO_DEALS } from './utils/demoData';
import { requestNotificationPermission } from './utils/sound';

function loadInitialCards() {
  const saved = storage.getCards();
  return saved ?? DEMO_CARDS;
}

function loadInitialDeals() {
  const saved = storage.getDeals();
  if (saved) return saved;
  return DEMO_DEALS;
}

export default function App() {
  const [cards, setCards] = useState(loadInitialCards);
  const [deals, setDeals] = useState(loadInitialDeals);
  const [archivedDeals, setArchivedDeals] = useState(() => storage.getArchivedDeals());
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { storage.saveCards(cards); }, [cards]);
  useEffect(() => { storage.saveDeals(deals); }, [deals]);
  useEffect(() => { storage.saveArchivedDeals(archivedDeals); }, [archivedDeals]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleAddCard = useCallback((cardData) => {
    setCards(prev => [...prev, { id: 'card-' + generateId(), ...cardData }]);
  }, []);

  const handleUpdateCard = useCallback((id, cardData) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...cardData } : c));
  }, []);

  const handleDeleteCard = useCallback((id) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleNewDeal = useCallback((deal) => {
    setDeals(prev => [...prev, deal]);
  }, []);

  const handleCompleteDeal = useCallback((deal) => {
    const math = calcDealMath({
      buyAmount: deal.stage1.buyAmount,
      buyRate: deal.stage1.buyRate,
      buyReward: deal.stage1.buyReward,
      sendAmount: deal.stage2.sendAmount,
      sellAmount: deal.stage3.sellAmount,
      sellRate: deal.stage3.sellRate,
      sellReward: deal.stage3.sellReward,
    });

    const sendAmount = parseFloat(deal.stage2.sendAmount) || 0;
    if (sendAmount > 0 && deal.stage2.cardId) {
      setCards(prev => prev.map(c =>
        c.id === deal.stage2.cardId
          ? { ...c, balance: Math.max(0, c.balance - sendAmount) }
          : c
      ));
    }

    const archived = {
      ...deal,
      status: 'completed',
      closeReason: 'completed',
      closedAt: Date.now(),
    };

    setDeals(prev => prev.filter(d => d.id !== deal.id));
    setArchivedDeals(prev => [...prev, archived]);
  }, []);

  const handleCancelDeal = useCallback((deal) => {
    const archived = {
      ...deal,
      status: 'cancelled',
      closeReason: 'cancelled',
      closedAt: Date.now(),
    };
    setDeals(prev => prev.filter(d => d.id !== deal.id));
    setArchivedDeals(prev => [...prev, archived]);
  }, []);

  const stats = (() => {
    const completedToday = archivedDeals.filter(d => {
      if (d.closeReason !== 'completed') return false;
      const today = new Date();
      const closed = new Date(d.closedAt);
      return closed.toDateString() === today.toDateString();
    });

    let totalPnL = 0;
    let totalVolume = 0;

    completedToday.forEach(deal => {
      const math = calcDealMath({
        buyAmount: deal.stage1.buyAmount,
        buyRate: deal.stage1.buyRate,
        buyReward: deal.stage1.buyReward,
        sendAmount: deal.stage2.sendAmount,
        sellAmount: deal.stage3.sellAmount,
        sellRate: deal.stage3.sellRate,
        sellReward: deal.stage3.sellReward,
      });
      totalPnL += parseFloat(math.pnl) || 0;
      totalVolume += (parseFloat(deal.stage1.buyAmount) || 0) + (parseFloat(deal.stage3.sellAmount) || 0);
    });

    deals.forEach(deal => {
      totalVolume += (parseFloat(deal.stage1.buyAmount) || 0) + (parseFloat(deal.stage3.sellAmount) || 0);
    });

    return {
      totalPnL,
      totalVolume,
      activeCount: deals.filter(d => d.status === 'active').length,
      completedCount: completedToday.length,
    };
  })();

  return (
    <div className="min-h-screen bg-dark-900">
      <Header stats={stats} />

      <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-5">
        <CardsPanel
          cards={cards}
          onAddCard={handleAddCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />

        <DealsJournal
          deals={deals}
          archivedDeals={archivedDeals}
          cards={cards}
          onComplete={handleCompleteDeal}
          onCancel={handleCancelDeal}
          onNewDeal={() => setShowForm(true)}
        />
      </main>

      {showForm && (
        <DealForm
          cards={cards}
          onClose={() => setShowForm(false)}
          onSubmit={handleNewDeal}
        />
      )}
    </div>
  );
}
