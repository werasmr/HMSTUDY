import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { Dispute } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatAmount, formatDate } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { OrderChat } from '../components/OrderChat';

export function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/disputes').then((res) => setDisputes(res.data)).finally(() => setLoading(false));
  }, []);

  const resolve = async (id: string) => {
    await api.patch(`/api/disputes/${id}/resolve`);
    const res = await api.get('/api/disputes');
    setDisputes(res.data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Споры</h1>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-bg-card rounded-xl border border-gray-700">Нет споров</div>
        ) : disputes.map((d) => (
          <div key={d.id} className="bg-bg-card rounded-xl border border-gray-700 p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-gray-300">{d.orderId.slice(0, 8)}...</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    d.status === 'OPEN' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>
                    {d.status === 'OPEN' ? 'Открыт' : 'Решён'}
                  </span>
                </div>
                <p className="text-gray-300">{d.reason}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(d.createdAt)}</p>
              </div>
              {d.order && (
                <div className="text-right text-sm">
                  <div className="font-medium text-gray-200">{formatAmount(d.order.amount)}</div>
                  <StatusBadge status={d.order.status} />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChatOrderId(d.orderId)}
                className="px-3 py-1.5 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
              >
                Открыть чат
              </button>
              {d.status === 'OPEN' && (
                <button
                  onClick={() => resolve(d.id)}
                  className="px-3 py-1.5 text-sm bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                >
                  Решить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {chatOrderId && (
        <Modal isOpen={!!chatOrderId} onClose={() => setChatOrderId(null)} title="Чат по спору" size="lg">
          <OrderChat orderId={chatOrderId} />
        </Modal>
      )}
    </div>
  );
}
