"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteEmployeeKpi, upsertEmployeeKpi } from "@/app/actions/employees";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KPI_PRESETS } from "@/lib/crud/configs/employees";
import { formatDate } from "@/lib/crud/utils";
import type { Employee, EmployeeKpi } from "@/types/database";

type EmployeeDetailProps = {
  employee: Employee;
  kpis: EmployeeKpi[];
  month: string;
};

function kpiProgress(value: number, target: number | null) {
  if (!target || target <= 0) return null;
  return Math.round((value / target) * 100);
}

export function EmployeeDetail({ employee, kpis, month }: EmployeeDetailProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleSaveKpi(formData: FormData) {
    const result = await upsertEmployeeKpi(employee.id, formData);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("KPI сохранён");
    startTransition(() => router.refresh());
  }

  async function handleDeleteKpi(kpiId: string) {
    if (!window.confirm("Удалить KPI?")) return;
    const result = await deleteEmployeeKpi(kpiId, employee.id);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("KPI удалён");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{employee.full_name}</h1>
          <p className="text-muted-foreground">Карточка сотрудника и KPI</p>
        </div>
        <Link href="/employees/performance" className="text-sm text-primary hover:underline">
          Таблица эффективности →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Должность</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{employee.position ?? "—"}</p>
            <p className="mt-1 text-muted-foreground">{employee.department ?? "Без отдела"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Статус</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{employee.status === "active" ? "Активен" : "Неактивен"}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Дата найма</CardTitle>
          </CardHeader>
          <CardContent>{formatDate(employee.hire_date)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Добавить / обновить KPI</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSaveKpi} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="period">Период (месяц)</Label>
              <Input id="period" name="period" type="month" defaultValue={month} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric_key">Метрика</Label>
              <select
                id="metric_key"
                name="metric_key"
                required
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                defaultValue={KPI_PRESETS[0].key}
                onChange={(event) => {
                  const label = KPI_PRESETS.find((item) => item.key === event.target.value)?.label;
                  const labelInput = document.getElementById("metric_label") as HTMLInputElement | null;
                  if (labelInput && label) labelInput.value = label;
                }}
              >
                {KPI_PRESETS.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="metric_label">Название метрики</Label>
              <Input
                id="metric_label"
                name="metric_label"
                defaultValue={KPI_PRESETS[0].label}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Факт</Label>
              <Input id="value" name="value" type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">План</Label>
              <Input id="target" name="target" type="number" step="0.01" />
            </div>
            <Button type="submit" disabled={pending}>
              Сохранить KPI
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">KPI за период</CardTitle>
        </CardHeader>
        <CardContent>
          {kpis.length === 0 ? (
            <p className="text-sm text-muted-foreground">KPI пока не введены</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Период</TableHead>
                  <TableHead>Метрика</TableHead>
                  <TableHead>Факт</TableHead>
                  <TableHead>План</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpis.map((kpi) => {
                  const progress = kpiProgress(kpi.value, kpi.target);
                  return (
                    <TableRow key={kpi.id}>
                      <TableCell>{formatDate(kpi.period)}</TableCell>
                      <TableCell>{kpi.metric_label}</TableCell>
                      <TableCell>{kpi.value}</TableCell>
                      <TableCell>{kpi.target ?? "—"}</TableCell>
                      <TableCell>
                        {progress != null ? (
                          <Badge variant={progress >= 100 ? "default" : "secondary"}>{progress}%</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteKpi(kpi.id)}>
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
