"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarDays } from "lucide-react";
import type { AnalyticsOverview } from "@/app/actions/analytics";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/crud/utils";

const STAGE_LABELS: Record<string, string> = {
  lead: "Лид",
  qualified: "Квалиф.",
  proposal: "Предложение",
  negotiation: "Переговоры",
  won: "Выиграна",
  lost: "Проиграна",
};

type AnalyticsDashboardProps = {
  data: AnalyticsOverview;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("month") ?? data.month;

  const dealChart = data.dealsByStage.map((item) => ({
    name: STAGE_LABELS[item.stage] ?? item.stage,
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Аналитика"
        description="Объединённая сводка: CRM, финансы, команда, инбокс и SMM"
      >
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const month = String(formData.get("month") ?? "");
            router.push(`/analytics?month=${month}`);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="month" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Месяц
            </Label>
            <Input id="month" name="month" type="month" defaultValue={current} />
          </div>
          <Button type="submit">Показать</Button>
        </form>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Клиенты"
          value={data.overview.counts.clients}
          tone="primary"
        />
        <StatCard
          title="Баланс"
          value={formatMoney(data.overview.finance.balance, data.currency)}
        />
        <StatCard
          title="Эффективность команды"
          value={`${data.avgTeamEfficiency}%`}
          description="Средний KPI за месяц"
        />
        <StatCard
          title="Новые в инбоксе"
          value={data.inboxNew}
          description={`${data.smmScheduled} постов в очереди`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>P&L по категориям</CardTitle>
            <CardDescription>Финансы за {data.month}</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {data.financeByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет транзакций за период</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.financeByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatMoney(Number(v ?? 0), data.currency)} />
                  <Bar dataKey="total" fill="oklch(0.45 0.18 264)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Воронка сделок</CardTitle>
            <CardDescription>Распределение по стадиям</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {dealChart.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет сделок</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dealChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="oklch(0.55 0.14 162)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые ссылки</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/finance" className={cn(buttonVariants({ variant: "outline" }))}>
            Финансы
          </Link>
          <Link href="/employees/performance" className={cn(buttonVariants({ variant: "outline" }))}>
            KPI команды
          </Link>
          <Link href="/inbox" className={cn(buttonVariants({ variant: "outline" }))}>
            Инбокс
          </Link>
          <Link href="/smm" className={cn(buttonVariants({ variant: "outline" }))}>
            SMM
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
