import { useEffect, useState } from 'react';
import { TrendingUp, CreditCard, ArrowLeftRight, Percent } from 'lucide-react';
import api from '../lib/api';
import type { DashboardStats } from '../types';
import { formatAmount } from '../lib/utils';

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-bg-card rounded-xl border border-gray-700 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon size={20} className="text-accent" />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Дашборд</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Оборот за день"
          value={formatAmount(stats?.turnover.day ?? 0)}
          sub={`${stats?.deals.day ?? 0} сделок`}
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Оборот за неделю"
          value={formatAmount(stats?.turnover.week ?? 0)}
          sub={`${stats?.deals.week ?? 0} сделок`}
        />
        <StatCard
          icon={TrendingUp}
          label="Оборот за месяц"
          value={formatAmount(stats?.turnover.month ?? 0)}
          sub={`${stats?.deals.month ?? 0} сделок`}
        />
        <StatCard
          icon={Percent}
          label="Конверсия"
          value={`${stats?.conversion ?? 0}%`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={CreditCard}
          label="Активные реквизиты"
          value={String(stats?.activeRequisites ?? 0)}
        />
        <StatCard
          icon={TrendingUp}
          label="Курс USDT/RUB"
          value={(stats?.usdtRate ?? 0).toFixed(2)}
        />
      </div>
    </div>
  );
}
