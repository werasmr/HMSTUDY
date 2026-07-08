"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/crud/utils";
import type { FinanceSummary } from "@/types/database";

type FinanceDashboardProps = {
  summary: FinanceSummary;
  month: string;
};

export function FinanceDashboard({ summary, month }: FinanceDashboardProps) {
  const chartData = summary.byCategory.map((item) => ({
    name: item.categoryName,
    total: item.total,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Финансы</h1>
          <p className="text-muted-foreground">
            Период: {summary.periodFrom} — {summary.periodTo}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={`/finance?month=${month}`} className="rounded-md border px-3 py-2 hover:bg-muted">
            Обзор
          </Link>
          <Link href="/finance/transactions" className="rounded-md border px-3 py-2 hover:bg-muted">
            Транзакции
          </Link>
          <Link href="/finance/accounts" className="rounded-md border px-3 py-2 hover:bg-muted">
            Счета
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Баланс</CardTitle>
            <CardDescription>Доходы − расходы за период</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoney(summary.balance, summary.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Доходы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatMoney(summary.income, summary.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Расходы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">
              {formatMoney(-summary.expense, summary.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>P&L по категориям</CardTitle>
          <CardDescription>Упрощённый отчёт за выбранный месяц</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет транзакций за период</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) =>
                    formatMoney(typeof value === "number" ? value : Number(value ?? 0), summary.currency)
                  }
                />
                <Bar dataKey="total" fill="#171717" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Таблица P&L</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {summary.byCategory.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет данных</p>
          )}
          {summary.byCategory.map((item) => (
            <div key={`${item.categoryId}-${item.categoryName}`} className="flex justify-between text-sm">
              <span>{item.categoryName}</span>
              <span className={item.total >= 0 ? "text-green-600" : "text-red-600"}>
                {formatMoney(item.total, summary.currency)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
