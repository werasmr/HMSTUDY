"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Company } from "@/types/database";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<
  | { href: string; label: string }
  | { label: string; children: Array<{ href: string; label: string }> }
> = [
  { href: "/dashboard", label: "Дашборд" },
  {
    label: "CRM",
    children: [
      { href: "/crm/clients", label: "Клиенты" },
      { href: "/crm/deals", label: "Сделки" },
      { href: "/crm/tasks", label: "Задачи" },
    ],
  },
  {
    label: "Финансы",
    children: [
      { href: "/finance", label: "Обзор" },
      { href: "/finance/transactions", label: "Транзакции" },
      { href: "/finance/accounts", label: "Счета" },
    ],
  },
  { href: "/products", label: "Продукты" },
  {
    label: "Сотрудники",
    children: [
      { href: "/employees", label: "Команда" },
      { href: "/employees/performance", label: "Эффективность" },
    ],
  },
  {
    label: "Конкуренты",
    children: [
      { href: "/competitors", label: "Список" },
      { href: "/competitors/compare", label: "Сравнение" },
    ],
  },
  { href: "/settings", label: "Настройки" },
];

type AppSidebarProps = {
  company: Company;
};

export function AppSidebar({ company }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <div>
          <p className="text-sm font-semibold">BizAuto</p>
          <p className="truncate text-xs text-muted-foreground">{company.name}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) =>
          "children" in item ? (
            <div key={item.label} className="space-y-1">
              <p className="px-3 py-1 text-xs font-medium uppercase text-muted-foreground">
                {item.label}
              </p>
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors",
                    child.href === "/finance"
                      ? pathname === "/finance"
                      : child.href === "/employees"
                        ? pathname === "/employees"
                        : child.href === "/competitors"
                          ? pathname === "/competitors"
                          : pathname.startsWith(child.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
      <div className="p-4">
        <div className="rounded-md border bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            Тариф: <span className="font-medium text-foreground">{company.plan}</span>
          </p>
          <p className="mt-1">
            Статус:{" "}
            <span className="font-medium text-foreground">
              {company.is_active ? "Активен" : "Заблокирован"}
            </span>
          </p>
        </div>
      </div>
    </aside>
  );
}
