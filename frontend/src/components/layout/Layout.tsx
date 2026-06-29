import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, CreditCard,
  Smartphone, AlertTriangle, Wallet, Receipt, User, LogOut,
  Menu, X,   Users, Shield, Coins, Percent, ArrowDownToLine,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Toggle } from '../ui/Toggle';
import { formatAmount } from '../../lib/utils';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { useEffect } from 'react';

import type { Role } from '../../types';

const traderNav = [
  { to: '/profile', icon: User, label: 'Профиль', roles: ['TRADER', 'MERCHANT', 'ADMIN'] as Role[] },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд', roles: ['TRADER', 'MERCHANT', 'ADMIN'] as Role[] },
  { to: '/transactions', icon: Receipt, label: 'Транзакции', roles: ['TRADER', 'MERCHANT', 'ADMIN'] as Role[] },
  { to: '/finances', icon: Wallet, label: 'Финансы', roles: ['TRADER', 'ADMIN'] as Role[] },
  { to: '/buy', icon: ArrowUpRight, label: 'Pay Out', roles: ['TRADER', 'ADMIN'] as Role[] },
  { to: '/sell', icon: ArrowDownLeft, label: 'Pay In', roles: ['TRADER', 'ADMIN'] as Role[] },
  { to: '/disputes', icon: AlertTriangle, label: 'Споры', roles: ['TRADER', 'MERCHANT', 'ADMIN'] as Role[] },
  { to: '/requisites', icon: CreditCard, label: 'Реквизиты', roles: ['TRADER', 'ADMIN'] as Role[] },
  { to: '/devices', icon: Smartphone, label: 'Устройства', roles: ['TRADER'] as Role[] },
];

const adminNav = [
  { to: '/admin/users', icon: Users, label: 'Пользователи', roles: ['ADMIN'] as Role[] },
  { to: '/admin/wallets', icon: Shield, label: 'Кошельки', roles: ['ADMIN'] as Role[] },
  { to: '/admin/currencies', icon: Coins, label: 'Валюты', roles: ['ADMIN'] as Role[] },
  { to: '/admin/commissions', icon: Percent, label: 'Ставки', roles: ['ADMIN'] as Role[] },
  { to: '/admin/deposits', icon: ArrowDownToLine, label: 'Пополнения', roles: ['ADMIN'] as Role[] },
];

export function Layout() {
  const { user, logout, toggleOnline } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [usdtRate, setUsdtRate] = useState(81.3);

  useEffect(() => {
    api.get('/api/dashboard/stats').then((res) => setUsdtRate(res.data.usdtRate)).catch(() => {});
  }, []);

  const role = user?.role ?? 'TRADER';
  const navItems = [...traderNav, ...adminNav].filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bg-sidebar flex flex-col transition-transform lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NW</span>
            </div>
            <span className="font-semibold text-gray-100">NETWORS</span>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800 space-y-3">
          {role === 'TRADER' && (
            <div className="flex items-center justify-between">
              <span className={cn(
                'px-2 py-0.5 rounded text-xs font-semibold',
                user?.isOnline ? 'bg-success/20 text-success' : 'bg-gray-700 text-gray-400'
              )}>
                {user?.isOnline ? 'ОНЛАЙН' : 'ОФФЛАЙН'}
              </span>
              <Toggle checked={user?.isOnline ?? false} onChange={toggleOnline} />
            </div>
          )}

          {role === 'TRADER' && (
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>USDT/RUB</span>
              <span className="text-gray-300 font-medium">{usdtRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Баланс</span>
              <span className="text-gray-300">{formatAmount(user?.balance ?? 0, 'USDT')}</span>
            </div>
            <div className="flex justify-between">
              <span>Заморожено</span>
              <span className="text-warning">{formatAmount(user?.frozenBalance ?? 0, 'USDT')}</span>
            </div>
            <div className="flex justify-between">
              <span>Страховой</span>
              <span className="text-gray-300">{formatAmount(user?.insuranceDeposit ?? 0, 'USDT')}</span>
            </div>
          </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-danger hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-bg-sidebar border-b border-gray-800">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400">
            <Menu size={24} />
          </button>
          <span className="font-semibold">NETWORS</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
