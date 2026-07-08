"use client";

import { usePathname } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleNav } from "@/components/layout/module-nav";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { formatMoney } from "@/lib/crud/utils";
import type { FinanceSummary } from "@/types/database";

type FinanceDashboardProps = {
  summary: FinanceSummary;
  month: string;
};

const FINANCE_NAV = [
  { href: "/finance", label: "Обзор" },
  { href: "/finance/transactions", label: "Транзакции" },
  { href: "/finance/accounts", label: "Счета" },
];

export function FinanceDashboard({ summary, month }: FinanceDashboardProps) {
  const pathname = usePathname();
  const chartData = summary.byCategory.map((item) => ({
    name: item.categoryName,
    total: item.total,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Финансы"
        description={`Период: ${summary.periodFrom} — ${summary.periodTo}`}
      >
        <ModuleNav
          items={FINANCE_NAV.map((item) => ({
            ...item,
            href: item.href === "/finance" ? `/finance?month=${month}` : item.href,
            isActive: pathname === item.href,
          }))}
        />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Баланс"
          description="Доходы − расходы за период"
          value={formatMoney(summary.balance, summary.currency)}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          title="Доходы"
          value={formatMoney(summary.income, summary.currency)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          title="Расходы"
          value={formatMoney(-summary.expense, summary.currency)}
          icon={TrendingDown}
          tone="danger"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>P&L по категориям</CardTitle>
          <CardDescription>Упрощённый отчёт за выбранный месяц</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed bg-muted/30">
              <p className="text-sm text-muted-foreground">Нет транзакций за период</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 264)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "oklch(0.5 0.02 264)" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: "oklch(0.5 0.02 264)" }} />
                <Tooltip
                  formatter={(value) =>
                    formatMoney(typeof value === "number" ? value : Number(value ?? 0), summary.currency)
                  }
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid oklch(0.9 0.01 264)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="oklch(0.45 0.18 264)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Таблица P&L</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {summary.byCategory.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет данных</p>
          )}
          {summary.byCategory.map((item) => (
            <div
              key={`${item.categoryId}-${item.categoryName}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm odd:bg-muted/40"
            >
              <span className="font-medium">{item.categoryName}</span>
              <span
                className={
                  item.total >= 0
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-red-700"
                }
              >
                {formatMoney(item.total, summary.currency)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
