import { Building2, Crown, LayoutDashboard } from "lucide-react";
import { getUserContext } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const ctx = await getUserContext();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Дашборд"
        description={`Добро пожаловать, ${ctx?.profile.full_name ?? ctx?.profile.email}`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Компания"
          description="Текущее рабочее пространство"
          value={ctx?.company.name}
          icon={Building2}
          tone="primary"
        />
        <StatCard
          title="Тариф"
          description="Назначается вручную"
          value={<span className="uppercase">{ctx?.company.plan}</span>}
          icon={Crown}
        />
        <StatCard
          title="Роль"
          description="Доступ в системе"
          value={ctx?.membership.role === "owner" ? "Владелец" : "Сотрудник"}
          icon={LayoutDashboard}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Модули в разработке</CardTitle>
          <CardDescription>
            CRM, финансы, продукты и остальные модули будут подключены на следующих этапах.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Схема БД и авторизация готовы. Следующий шаг — общий CRUD-конструктор и модуль CRM.
        </CardContent>
      </Card>
    </div>
  );
}
