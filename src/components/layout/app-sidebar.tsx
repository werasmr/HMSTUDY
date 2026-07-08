"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Company } from "@/types/database";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Дашборд" },
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
        {NAV_ITEMS.map((item) => (
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
        ))}
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
