import { useState, useEffect } from 'react';
import Header from './components/Header';
import CardsPanel from './components/CardsPanel';
import DealForm from './components/DealForm';
import DealsJournal from './components/DealsJournal';
import { storage } from './utils/storage';
import { calcRouteMath, generateId } from './utils/calculations';
import { DEMO_CARDS, DEMO_ROUTES } from './utils/demoData';

export default function App() {
  const [cards, setCards] = useState(() => storage.getCards() ?? DEMO_CARDS);
  const [routes, setRoutes] = useState(() => storage.getRoutes() ?? DEMO_ROUTES);
  const [archived, setArchived] = useState(() => storage.getArchivedRoutes());
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { storage.saveCards(cards); }, [cards]);
  useEffect(() => { storage.saveRoutes(routes); }, [routes]);
  useEffect(() => { storage.saveArchivedRoutes(archived); }, [archived]);

  function addCard(data) {
    setCards(prev => [...prev, { id: 'c' + generateId(), ...data }]);
  }
  function updateCard(id, data) {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }
  function deleteCard(id) {
    setCards(prev => prev.filter(c => c.id !== id));
  }

  function addRoute(route) {
    setRoutes(prev => [...prev, route]);
  }

  function updateRoute(id, patch) {
    setRoutes(prev => prev.map(route => route.id === id ? { ...route, ...patch } : route));
  }

  function completeRoute(routeId) {
    setRoutes(prev => {
      const route = prev.find(item => item.id === routeId);
      if (!route) return prev;

      const { remaining } = calcRouteMath(route);
      if (remaining > 0 && route.topUpCardId) {
        setCards(c => c.map(card =>
          card.id === route.topUpCardId
            ? { ...card, balance: Math.max(0, card.balance - remaining) }
            : card
        ));
      }

      setArchived(a => [...a, { ...route, status: 'completed', closedAt: Date.now() }]);
      return prev.filter(item => item.id !== routeId);
    });
  }

  function cancelRoute(routeId) {
    setRoutes(prev => {
      const route = prev.find(item => item.id === routeId);
      if (!route) return prev;
      setArchived(a => [...a, { ...route, status: 'cancelled', closedAt: Date.now() }]);
      return prev.filter(item => item.id !== routeId);
    });
  }

  const stats = (() => {
    const today = new Date().toDateString();
    const todayDone = archived.filter(d =>
      d.status === 'completed' && new Date(d.closedAt).toDateString() === today
    );
    const pnl = todayDone.reduce((sum, route) => sum + calcRouteMath(route).pnl, 0);
    const livePnL = routes.reduce((sum, route) => sum + calcRouteMath(route).pnl, 0);
    const volume = [...routes, ...archived].reduce((sum, route) => sum + calcRouteMath(route).totalInputAmount, 0);
    return { pnl, livePnL, volume, active: routes.length, completed: todayDone.length };
  })();

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <Header stats={stats} />
      <main className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        <CardsPanel cards={cards} onAdd={addCard} onUpdate={updateCard} onDelete={deleteCard} />
        <DealsJournal
          routes={routes}
          archived={archived}
          cards={cards}
          onComplete={completeRoute}
          onCancel={cancelRoute}
          onUpdate={updateRoute}
          onNewDeal={() => setShowForm(true)}
        />
      </main>
      {showForm && (
        <DealForm onClose={() => setShowForm(false)} onSubmit={addRoute} />
      )}
    </div>
  );
}
