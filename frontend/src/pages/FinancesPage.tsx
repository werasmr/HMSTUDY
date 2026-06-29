import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { Transaction } from '../types';
import type { Wallet } from '../types/admin';
import { useAuth } from '../context/AuthContext';
import { formatAmount, formatDate } from '../lib/utils';

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: 'Пополнение',
  WITHDRAWAL: 'Списание',
  FEE: 'Комиссия',
  FREEZE: 'Заморозка',
  UNFREEZE: 'Разморозка',
};

export function FinancesPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    if (user?.role === 'TRADER') {
      api.get('/api/wallets/my').then((r) => setWallets(r.data)).catch(() => {});
    }
  }, [user?.role]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Финансы</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-card rounded-xl border border-gray-700 p-5">
          <p className="text-sm text-gray-400 mb-1">Баланс</p>
          <p className="text-2xl font-bold text-gray-100">{formatAmount(user?.balance ?? 0, 'USDT')}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-gray-700 p-5">
          <p className="text-sm text-gray-400 mb-1">Заморожено</p>
          <p className="text-2xl font-bold text-warning">{formatAmount(user?.frozenBalance ?? 0, 'USDT')}</p>
        </div>
        <div className="bg-bg-card rounded-xl border border-gray-700 p-5">
          <p className="text-sm text-gray-400 mb-1">Страховой депозит</p>
          <p className="text-2xl font-bold text-gray-100">{formatAmount(user?.insuranceDeposit ?? 0, 'USDT')}</p>
        </div>
      </div>

      {user?.role === 'TRADER' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-3">Мои USDT-кошельки</h2>
          <p className="text-sm text-gray-500 mb-4">Кошельки назначает администратор. Пополняйте баланс на эти адреса.</p>
          {wallets.length === 0 ? (
            <div className="bg-bg-card rounded-xl border border-gray-700 p-8 text-center text-gray-500">
              Кошельки ещё не назначены. Обратитесь к администратору.
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((w) => (
                <div key={w.id} className="bg-bg-card rounded-xl border border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">{w.network}</span>
                    {w.label && <span className="text-sm text-gray-400">{w.label}</span>}
                  </div>
                  <p className="font-mono text-sm text-gray-200 break-all">{w.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/transactions').then((res) => setTransactions(res.data.transactions)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Транзакции</h1>

      <div className="bg-bg-card rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-left">
              <th className="px-4 py-3 font-medium">Тип</th>
              <th className="px-4 py-3 font-medium">Сумма</th>
              <th className="px-4 py-3 font-medium">Сделка</th>
              <th className="px-4 py-3 font-medium">Дата</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Загрузка...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Нет транзакций</td></tr>
            ) : transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    tx.type === 'DEPOSIT' || tx.type === 'UNFREEZE' ? 'bg-success/10 text-success' :
                    tx.type === 'FREEZE' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                  }`}>
                    {TYPE_LABELS[tx.type]}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-200">
                  {formatAmount(tx.amount, tx.currency)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {tx.order?.id ? tx.order.id.slice(0, 8) + '...' : '—'}
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(tx.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
