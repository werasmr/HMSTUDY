import {
  ArrowLeftRight,
  Bot,
  Calculator,
  CheckSquare,
  GitCompare,
  Handshake,
  Landmark,
  LayoutDashboard,
  Package,
  Settings,
  Target,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; children: NavLink[] };
export type NavItem = NavLink | NavGroup;

export const APP_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/assistant", label: "AI-ассистент", icon: Bot },
  {
    label: "CRM",
    children: [
      { href: "/crm/clients", label: "Клиенты", icon: Users },
      { href: "/crm/deals", label: "Сделки", icon: Handshake },
      { href: "/crm/tasks", label: "Задачи", icon: CheckSquare },
    ],
  },
  {
    label: "Финансы",
    children: [
      { href: "/finance", label: "Обзор", icon: Wallet },
      { href: "/finance/transactions", label: "Транзакции", icon: ArrowLeftRight },
      { href: "/finance/accounts", label: "Счета", icon: Landmark },
    ],
  },
  { href: "/products", label: "Продукты", icon: Package },
  { href: "/pricing", label: "Ценообразование", icon: Calculator },
  {
    label: "Сотрудники",
    children: [
      { href: "/employees", label: "Команда", icon: UsersRound },
      { href: "/employees/performance", label: "Эффективность", icon: TrendingUp },
    ],
  },
  {
    label: "Конкуренты",
    children: [
      { href: "/competitors", label: "Список", icon: Target },
      { href: "/competitors/compare", label: "Сравнение", icon: GitCompare },
    ],
  },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/finance") return pathname === "/finance";
  if (href === "/employees") return pathname === "/employees";
  if (href === "/competitors") return pathname === "/competitors";
  if (href === "/assistant") return pathname.startsWith("/assistant");
  return pathname === href || pathname.startsWith(`${href}/`);
}
