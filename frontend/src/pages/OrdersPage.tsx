import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, MessageCircle, ArrowRightLeft } from 'lucide-react';
import api from '../lib/api';
import type { Order, OrderStatus, OrderType } from '../types';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { formatAmount, formatDate, formatCardNumber, formatPhone, getTimeLeft } from '../lib/utils';
import { OrderChat } from '../components/OrderChat';
import { useSocket } from '../context/SocketContext';

interface OrdersPageProps {
  type: OrderType;
  title: string;
}

const STATUSES: OrderStatus[] = ['WAITING_PAYMENT', 'PAID', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'DISPUTED'];

export function OrdersPage({ type, title }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const { socket } = useSocket();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders', {
        params: {
          type, page, limit: 20,
          search: search || undefined,
          status: statusFilter || undefined,
          minAmount: minAmount || undefined,
          maxAmount: maxAmount || undefined,
        },
      });
      setOrders(res.data.orders);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [type, page, search, statusFilter, minAmount, maxAmount]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const handler = () => fetchOrders();
    socket?.on('new_order', handler);
    socket?.on('order_update', handler);
    return () => {
      socket?.off('new_order', handler);
      socket?.off('order_update', handler);
    };
  }, [socket, fetchOrders]);

  const confirmOrder = async (id: string) => {
    await api.post(`/api/orders/${id}/confirm`);
    fetchOrders();
  };

  const getRequisiteDisplay = (order: Order) => {
    const req = order.requisite;
    if (!req) return '—';
    const reqType = req.acceptSbp ? 'СБП' : req.acceptAccount ? 'Счёт' : 'Карта';
    const num = req.phone || req.cardNumber || req.accountNumber || '';
    const formatted = req.phone ? formatPhone(num) : formatCardNumber(num);
    return `${reqType} ${formatted}`;
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">{title}</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Поиск по ID..."
            className="w-full pl-9 pr-3 py-2 bg-bg-card border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-bg-card border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-accent"
        >
          <option value="">Все статусы</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="number"
          value={minAmount}
          onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
          placeholder="Мин. сумма"
          className="w-32 px-3 py-2 bg-bg-card border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-accent"
        />
        <input
          type="number"
          value={maxAmount}
          onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
          placeholder="Макс. сумма"
          className="w-32 px-3 py-2 bg-bg-card border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-accent"
        />
      </div>

      <div className="bg-bg-card rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Курс</th>
                <th className="px-4 py-3 font-medium">Реквизиты</th>
                <th className="px-4 py-3 font-medium">Таймер</th>
                <th className="px-4 py-3 font-medium">Создана</th>
                <th className="px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Загрузка...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Нет заявок</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-gray-300">{order.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-200">{formatAmount(order.amount, order.currencyCode)}</div>
                    <div className="text-xs text-gray-500">{formatAmount(order.amountUsdt, 'USDT')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>{order.rate.toFixed(2)}</span>
                      <ArrowRightLeft size={12} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px]">
                    {getRequisiteDisplay(order)}
                    {order.requisite && <div className="text-gray-500">{order.requisite.bank}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {['WAITING_PAYMENT', 'PENDING'].includes(order.status) && (
                      <span className="font-mono text-warning text-xs">{getTimeLeft(order.expiresAt)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {['WAITING_PAYMENT', 'PAID'].includes(order.status) && (
                        <button
                          onClick={() => confirmOrder(order.id)}
                          className="p-1.5 hover:bg-success/10 rounded text-success"
                          title="Подтвердить"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setChatOrder(order)}
                        className="p-1.5 hover:bg-accent/10 rounded text-accent"
                        title="Чат"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
            <span className="text-sm text-gray-500">Всего: {total}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Назад</Button>
              <span className="px-3 py-1 text-sm text-gray-400">{page} / {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Далее</Button>
            </div>
          </div>
        )}
      </div>

      {chatOrder && (
        <Modal isOpen={!!chatOrder} onClose={() => setChatOrder(null)} title={`Чат — ${chatOrder.id.slice(0, 8)}`} size="lg">
          <OrderChat orderId={chatOrder.id} onClose={() => setChatOrder(null)} />
        </Modal>
      )}
    </div>
  );
}
