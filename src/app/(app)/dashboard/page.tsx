import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileText,
  TrendingDown,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react";
import { getBusinessHealth } from "@/app/actions/business";
import { getDashboardOverview } from "@/app/actions/dashboard";
import { getUserContext } from "@/lib/auth";
import { getBusinessType } from "@/lib/business-types";
import { ModuleGrid } from "@/components/dashboard/module-grid";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/crud/utils";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const ctx = await getUserContext();
  const [overview, health] = await Promise.all([
    getDashboardOverview(),
    getBusinessHealth().catch(() => null),
  ]);

  const issues = health?.issues ?? [];
  const businessType = getBusinessType(ctx?.company.business_type);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Дашборд"
        description={`${ctx?.company.name ?? ""} · ${businessType.label} · Добро пожаловать, ${ctx?.profile.full_name ?? ctx?.profile.email}`}
        actions={
          <>
            <Link href="/reports" className={cn(buttonVariants({ variant: "outline" }))}>
              <FileText className="mr-2 h-4 w-4" />
              Отчёты
            </Link>
            <Link href="/chat" className={cn(buttonVariants())}>
              <Bot className="mr-2 h-4 w-4" />
              Спросить AI CEO
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Выручка"
          description="Доходы за этот месяц"
          value={formatMoney(overview.finance.income, overview.finance.currency)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          title="Прибыль"
          description="Доходы − расходы"
          value={formatMoney(overview.finance.balance, overview.finance.currency)}
          icon={overview.finance.balance < 0 ? TrendingDown : Wallet}
          tone={overview.finance.balance < 0 ? "danger" : "primary"}
        />
        <StatCard
          title="Сотрудники"
          description="Активная команда"
          value={overview.counts.employees}
          icon={UsersRound}
        />
        <StatCard
          title="Проблемы"
          description="Найдено AI-анализом"
          value={issues.length}
          icon={AlertTriangle}
          tone={issues.length > 0 ? "danger" : "success"}
        />
      </div>

      <Card
        className={cn(
          issues.length > 0
            ? "border-amber-200/80 bg-amber-50/40"
            : "border-emerald-200/80 bg-emerald-50/30",
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {issues.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            Проблемы бизнеса
          </CardTitle>
          <CardDescription>
            {issues.length > 0
              ? "AI нашёл точки, требующие внимания владельца"
              : "Критичных проблем не обнаружено"}
          </CardDescription>
        </CardHeader>
        {issues.length > 0 && (
          <CardContent className="space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.text}
                className="flex items-start gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    issue.severity === "danger" ? "bg-red-500" : "bg-amber-500",
                  )}
                />
                {issue.text}
              </div>
            ))}
            <Link
              href="/chat"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Обсудить с AI CEO →
            </Link>
          </CardContent>
        )}
      </Card>

      <ModuleGrid overview={overview} />

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Быстрый старт</CardTitle>
          <CardDescription>Типичные первые шаги после регистрации</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
          <Link
            href="/finance/accounts"
            className="rounded-lg border bg-background px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="font-medium">Подключить счёт</p>
            <p className="mt-1 text-muted-foreground">Загрузите выписку — появятся выручка и прибыль</p>
          </Link>
          <Link
            href="/employees"
            className="rounded-lg border bg-background px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="font-medium">Добавить сотрудников</p>
            <p className="mt-1 text-muted-foreground">Команда и KPI: {businessType.kpis.map((kpi) => kpi.label.toLowerCase()).join(", ")}</p>
          </Link>
          <Link
            href="/reports"
            className="rounded-lg border bg-background px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="font-medium">Получить отчёт AI CEO</p>
            <p className="mt-1 text-muted-foreground">Ежедневная сводка с рекомендациями</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
