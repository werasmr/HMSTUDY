import { getUserContext } from "@/lib/auth";
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground">
          Добро пожаловать, {ctx?.profile.full_name ?? ctx?.profile.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Компания</CardTitle>
            <CardDescription>Текущее рабочее пространство</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{ctx?.company.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Тариф</CardTitle>
            <CardDescription>Назначается вручную</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold uppercase">{ctx?.company.plan}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Роль</CardTitle>
            <CardDescription>Доступ в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {ctx?.membership.role === "owner" ? "Владелец" : "Сотрудник"}
            </p>
          </CardContent>
        </Card>
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
