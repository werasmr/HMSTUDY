import {
  ArrowLeftRight,
  BarChart3,
  Bot,
  Calculator,
  CheckSquare,
  FileText,
  GitCompare,
  Handshake,
  Inbox,
  Landmark,
  LayoutDashboard,
  Package,
  Settings,
  Share2,
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
  { href: "/chat", label: "AI CEO", icon: Bot },
  { href: "/reports", label: "Отчёты", icon: FileText },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  {
    label: "Клиенты",
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
  {
    label: "Маркетинг",
    children: [
      { href: "/inbox", label: "Инбокс", icon: Inbox },
      { href: "/inbox/channels", label: "Каналы", icon: Inbox },
      { href: "/smm", label: "SMM", icon: Share2 },
      { href: "/smm/accounts", label: "SMM-аккаунты", icon: Share2 },
    ],
  },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/finance") return pathname === "/finance";
  if (href === "/employees") return pathname === "/employees";
  if (href === "/competitors") return pathname === "/competitors";
  if (href === "/chat") return pathname.startsWith("/chat") || pathname.startsWith("/assistant");
  if (href === "/reports") return pathname.startsWith("/reports");
  if (href === "/analytics") return pathname.startsWith("/analytics");
  if (href === "/inbox") return pathname === "/inbox";
  if (href === "/inbox/channels") return pathname.startsWith("/inbox/channels");
  if (href === "/smm") return pathname === "/smm";
  if (href === "/smm/accounts") return pathname.startsWith("/smm/accounts");
  return pathname === href || pathname.startsWith(`${href}/`);
}
