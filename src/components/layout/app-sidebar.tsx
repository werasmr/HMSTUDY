"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import type { Company } from "@/types/database";
import { APP_NAV_ITEMS, isNavActive } from "@/components/layout/nav-config";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
        {APP_NAV_ITEMS.map((item) =>
          "children" in item ? (
            <div key={item.label} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {item.label}
              </p>
              <div className="space-y-0.5 rounded-xl border border-sidebar-border/80 bg-background/60 p-1">
                {item.children.map((child) => {
                  const active = isNavActive(pathname, child.href);
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
                isNavActive(pathname, item.href)
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

export function MobileNav({ company }: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "outline", size: "icon" }), "md:hidden")}
        aria-label="Меню"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle>Proto</SheetTitle>
          <p className="text-xs text-muted-foreground">{company.name}</p>
        </SheetHeader>
        <nav className="space-y-4 overflow-y-auto p-3">
          {APP_NAV_ITEMS.map((item) =>
            "children" in item ? (
              <div key={item.label} className="space-y-1">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                {item.children.map((child) => {
                  const Icon = child.icon;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                        isNavActive(pathname, child.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  isNavActive(pathname, item.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
