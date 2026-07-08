"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type ModuleNavItem = {
  href: string;
  label: string;
  isActive?: boolean;
};

type ModuleNavProps = {
  items: ModuleNavItem[];
  className?: string;
};

export function ModuleNav({ items, className }: ModuleNavProps) {
  return (
    <nav
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-sm",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
            item.isActive
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
