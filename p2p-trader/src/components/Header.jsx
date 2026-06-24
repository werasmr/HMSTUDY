import { TrendingUp, Activity, CheckCircle, Clock, Zap } from 'lucide-react';
import { formatMoney } from '../utils/calculations';

export default function Header({ stats }) {
  const { totalPnL, totalVolume, activeCount, completedCount } = stats;

  return (
    <header className="sticky top-0 z-50 glass border-b border-dark-400/50">
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Zap size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none">P2P Trader</h1>
              <p className="text-gray-500 text-xs">Финансовый учёт</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <StatPill
              icon={<TrendingUp size={14} />}
              label="PnL за день"
              value={`${totalPnL >= 0 ? '+' : ''}${formatMoney(totalPnL)} ₽`}
              color={totalPnL >= 0 ? 'green' : 'red'}
            />
            <StatPill
              icon={<Activity size={14} />}
              label="Оборот"
              value={`${formatMoney(totalVolume)} ₽`}
              color="blue"
            />
            <StatPill
              icon={<Clock size={14} />}
              label="Активные"
              value={activeCount}
              color="orange"
            />
            <StatPill
              icon={<CheckCircle size={14} />}
              label="Завершено"
              value={completedCount}
              color="purple"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ icon, label, value, color }) {
  const colorMap = {
    green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorMap[color]} text-sm`}>
      <span className="opacity-80">{icon}</span>
      <span className="text-gray-400 text-xs hidden sm:inline">{label}:</span>
      <span className="font-semibold font-mono">{value}</span>
    </div>
  );
}
