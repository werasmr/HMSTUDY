import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import api from '../../lib/api';
import { formatAmount, formatDate } from '../../lib/utils';

interface Deposit {
  id: string;
  amount: number;
  currencyCode: string;
  txHash?: string;
  status: string;
  createdAt: string;
  trader?: { email: string };
  wallet?: { address: string; network: string };
}

export function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/api/admin/deposits').then((r) => setDeposits(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const approve = async (id: string) => {
    await api.post(`/api/admin/deposits/${id}/approve`);
    fetchData();
  };

  const reject = async (id: string) => {
    await api.post(`/api/admin/deposits/${id}/reject`);
    fetchData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Заявки на пополнение</h1>
      <div className="bg-bg-card rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-left">
              <th className="px-4 py-3">Трейдер</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Кошелёк</th>
              <th className="px-4 py-3">TX Hash</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Загрузка...</td></tr>
            ) : deposits.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Нет заявок</td></tr>
            ) : deposits.map((d) => (
              <tr key={d.id} className="border-b border-gray-800">
                <td className="px-4 py-3 text-gray-200">{d.trader?.email}</td>
                <td className="px-4 py-3">{formatAmount(d.amount, d.currencyCode)}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{d.wallet?.address?.slice(0, 12)}...</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.txHash || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${d.status === 'PENDING' ? 'text-warning' : d.status === 'APPROVED' ? 'text-success' : 'text-danger'}`}>{d.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(d.createdAt)}</td>
                <td className="px-4 py-3">
                  {d.status === 'PENDING' && (
                    <div className="flex gap-1">
                      <button onClick={() => approve(d.id)} className="p-1.5 text-success hover:bg-success/10 rounded"><Check size={16} /></button>
                      <button onClick={() => reject(d.id)} className="p-1.5 text-danger hover:bg-danger/10 rounded"><X size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
