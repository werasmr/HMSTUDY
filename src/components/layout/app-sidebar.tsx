"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
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
import type { Company } from "@/types/database";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; children: NavLink[] };
type NavItem = NavLink | NavGroup;

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
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

function isActive(pathname: string, href: string) {
  if (href === "/finance") return pathname === "/finance";
  if (href === "/employees") return pathname === "/employees";
  if (href === "/competitors") return pathname === "/competitors";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppSidebarProps = {
  company: Company;
};

export function AppSidebar({ company }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/30">
            P
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
              Proto
            </p>
            <p className="truncate text-xs text-muted-foreground">{company.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) =>
          "children" in item ? (
            <div key={item.label} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {item.label}
              </p>
              <div className="space-y-0.5 rounded-xl border border-sidebar-border/80 bg-background/60 p-1">
                {item.children.map((child) => {
                  const active = isActive(pathname, child.href);
                  const Icon = child.icon;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive(pathname, item.href)
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-80" />
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Тариф</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold uppercase text-primary">
              {company.plan}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Статус</span>
            <span
              className={cn(
                "font-medium",
                company.is_active ? "text-emerald-600" : "text-red-600",
              )}
            >
              {company.is_active ? "Активен" : "Заблокирован"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
