import Link from "next/link";
import {
  Building2,
  CheckSquare,
  Crown,
  Handshake,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { getDashboardOverview } from "@/app/actions/dashboard";
import { getUserContext } from "@/lib/auth";
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
  const overview = await getDashboardOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Дашборд"
        description={`Добро пожаловать, ${ctx?.profile.full_name ?? ctx?.profile.email}`}
        actions={
          <>
            <Link href="/crm/clients" className={cn(buttonVariants({ variant: "outline" }))}>
              <Users className="mr-2 h-4 w-4" />
              Клиенты
            </Link>
            <Link href="/finance" className={cn(buttonVariants())}>
              <Wallet className="mr-2 h-4 w-4" />
              Финансы
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Компания"
          description={ctx?.company.name}
          value={<span className="text-lg">{ctx?.membership.role === "owner" ? "Владелец" : "Сотрудник"}</span>}
          icon={Building2}
          tone="primary"
        />
        <StatCard
          title="Клиенты"
          description="В базе CRM"
          value={overview.counts.clients}
          icon={Users}
        />
        <StatCard
          title="Сделки"
          description="Активные воронки"
          value={overview.counts.deals}
          icon={Handshake}
        />
        <StatCard
          title="Тариф"
          value={<span className="uppercase">{ctx?.company.plan}</span>}
          icon={Crown}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Баланс за месяц"
          description="Доходы − расходы"
          value={formatMoney(overview.finance.balance, overview.finance.currency)}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          title="Доходы"
          value={formatMoney(overview.finance.income, overview.finance.currency)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          title="Открытые задачи"
          description="Требуют внимания"
          value={overview.counts.openTasks}
          icon={CheckSquare}
          tone={overview.counts.openTasks > 0 ? "danger" : "default"}
        />
      </div>

      <ModuleGrid overview={overview} />

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Быстрый старт</CardTitle>
          <CardDescription>Типичные первые шаги после регистрации</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
          <Link
            href="/crm/clients"
            className="rounded-lg border bg-background px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="font-medium">Добавить клиентов</p>
            <p className="mt-1 text-muted-foreground">Вручную или импортом CSV</p>
          </Link>
          <Link
            href="/finance/accounts"
            className="rounded-lg border bg-background px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="font-medium">Подключить счёт</p>
            <p className="mt-1 text-muted-foreground">Загрузите выписку для транзакций</p>
          </Link>
          <Link
            href="/products"
            className="rounded-lg border bg-background px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="font-medium">Заполнить каталог</p>
            <p className="mt-1 text-muted-foreground">Товары и услуги с AI-описаниями</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
