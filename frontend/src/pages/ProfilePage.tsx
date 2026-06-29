import { useAuth } from '../context/AuthContext';
import { formatAmount, formatDate } from '../lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ProfilePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Профиль</h1>

      <div className="bg-bg-card rounded-xl border border-gray-700 p-6 max-w-lg space-y-4">
        <div>
          <label className="text-sm text-gray-400">Email</label>
          <p className="text-gray-100 font-medium">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Роль</label>
          <p className="text-gray-100 font-medium">{user?.role}</p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Баланс</label>
          <p className="text-gray-100 font-medium">{formatAmount(user?.balance ?? 0, 'USDT')}</p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Заморожено</label>
          <p className="text-warning font-medium">{formatAmount(user?.frozenBalance ?? 0, 'USDT')}</p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Страховой депозит</label>
          <p className="text-gray-100 font-medium">{formatAmount(user?.insuranceDeposit ?? 0, 'USDT')}</p>
        </div>
        {user?.createdAt && (
          <div>
            <label className="text-sm text-gray-400">Дата регистрации</label>
            <p className="text-gray-100">{formatDate(user.createdAt)}</p>
          </div>
        )}
        {user?.apiKey && (
          <div>
            <label className="text-sm text-gray-400">API Key</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 px-3 py-2 bg-bg-primary rounded-lg text-xs text-gray-300 font-mono break-all">
                {user.apiKey}
              </code>
              <button onClick={copyApiKey} className="p-2 text-gray-400 hover:text-accent">
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
