import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calculator,
  CheckSquare,
  Package,
  Target,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardOverview } from "@/app/actions/dashboard";

type ModuleStatus = "ready" | "soon";

type ModuleItem = {
  href?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  status: ModuleStatus;
  metric?: string;
};

function buildModules(overview: DashboardOverview): ModuleItem[] {
  const { counts } = overview;

  return [
    {
      href: "/crm/clients",
      label: "CRM",
      description: "Клиенты, сделки и задачи",
      icon: Users,
      status: "ready",
      metric: `${counts.clients} клиентов · ${counts.deals} сделок`,
    },
    {
      href: "/finance",
      label: "Финансы",
      description: "Обзор, транзакции и счета",
      icon: Wallet,
      status: "ready",
      metric: `${counts.transactionsThisMonth} операций в этом месяце`,
    },
    {
      href: "/products",
      label: "Продукты",
      description: "Каталог товаров и услуг",
      icon: Package,
      status: "ready",
      metric: `${counts.products} позиций`,
    },
    {
      href: "/pricing",
      label: "Ценообразование",
      description: "Калькулятор маржи и AI-рекомендации",
      icon: Calculator,
      status: "ready",
    },
    {
      href: "/employees",
      label: "Сотрудники",
      description: "Команда и KPI",
      icon: UsersRound,
      status: "ready",
      metric: `${counts.employees} человек`,
    },
    {
      href: "/competitors",
      label: "Конкуренты",
      description: "Мониторинг цен и сравнение",
      icon: Target,
      status: "ready",
    },
    {
      href: "/crm/tasks",
      label: "Задачи",
      description: "Открытые задачи по компании",
      icon: CheckSquare,
      status: "ready",
      metric: counts.openTasks > 0 ? `${counts.openTasks} открытых` : "Нет открытых",
    },
    {
      href: "/employees/performance",
      label: "Аналитика",
      description: "Таблица эффективности команды",
      icon: TrendingUp,
      status: "ready",
    },
    {
      href: "/assistant",
      label: "AI-ассистент",
      description: "Единый чат по данным компании",
      icon: Bot,
      status: "ready",
      metric: "Спросите про финансы и клиентов",
    },
  ];
}

type ModuleGridProps = {
  overview: DashboardOverview;
};

export function ModuleGrid({ overview }: ModuleGridProps) {
  const modules = buildModules(overview);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Модули Proto</CardTitle>
        <CardDescription>
          Все основные разделы уже доступны. Нажмите на карточку, чтобы перейти.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            const isReady = module.status === "ready" && module.href;

            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "rounded-xl p-2.5",
                      isReady ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant={isReady ? "default" : "secondary"}>
                    {isReady ? "Готово" : "Скоро"}
                  </Badge>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="font-semibold">{module.label}</p>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  {module.metric && (
                    <p className="text-xs font-medium text-primary/80">{module.metric}</p>
                  )}
                </div>
                {isReady && (
                  <div className="mt-4 flex items-center text-sm font-medium text-primary">
                    Открыть
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                )}
              </>
            );

            if (isReady && module.href) {
              return (
                <Link
                  key={module.label}
                  href={module.href}
                  className="group rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={module.label}
                className="rounded-xl border border-dashed bg-muted/20 p-4 opacity-80"
              >
                {content}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
