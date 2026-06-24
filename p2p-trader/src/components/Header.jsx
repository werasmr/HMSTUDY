import { Zap } from 'lucide-react';
import { fmt } from '../utils/calculations';

export default function Header({ stats }) {
  const { pnl, livePnL, volume, active, completed } = stats;
  return (
    <div className="border-b border-[#30363d] bg-[#161b22]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <Zap size={16} className="text-blue-400" />
          <span className="font-semibold text-white text-sm">P2P Trader</span>
        </div>
        <div className="flex items-center gap-5 text-sm flex-wrap">
          <Stat label="Live PnL" value={`${livePnL >= 0 ? '+' : ''}${fmt(livePnL)} ₽`} color={livePnL >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <Stat label="PnL день" value={`${pnl >= 0 ? '+' : ''}${fmt(pnl)} ₽`} color={pnl >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <Stat label="Оборот" value={`${fmt(volume)} ₽`} />
          <Stat label="Маршрутов" value={active} color="text-blue-400" />
          <Stat label="Закрыто" value={completed} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'text-[#c9d1d9]' }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#8b949e]">{label}:</span>
      <span className={`mono font-medium ${color}`}>{value}</span>
    </div>
  );
}
