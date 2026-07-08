"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import type { PerformanceRow } from "@/types/database";

type PerformanceTableProps = {
  rows: PerformanceRow[];
  month: string;
  metricKeys: string[];
};

function findKpi(row: PerformanceRow, metricKey: string) {
  return row.kpis.find((kpi) => kpi.metric_key === metricKey);
}

export function PerformanceTable({ rows, month, metricKeys }: PerformanceTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Эффективность сотрудников</h1>
          <p className="text-muted-foreground">Сводка KPI за месяц (ручной ввод)</p>
        </div>
        <Link href="/employees" className="text-sm text-primary hover:underline">
          ← Список сотрудников
        </Link>
      </div>

      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const nextMonth = String(formData.get("month") ?? "");
          router.push(`/employees/performance?month=${nextMonth}`);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="month">Месяц</Label>
          <Input
            id="month"
            name="month"
            type="month"
            defaultValue={searchParams.get("month") ?? month}
          />
        </div>
        <Button type="submit" variant="outline">
          Показать
        </Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Сотрудник</TableHead>
              <TableHead>Должность</TableHead>
              {metricKeys.map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
              <TableHead>Эффективность</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4 + metricKeys.length} className="text-center text-muted-foreground">
                  Нет активных сотрудников
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.employee.id}>
                <TableCell>
                  <Link href={`/employees/${row.employee.id}`} className="font-medium hover:underline">
                    {row.employee.full_name}
                  </Link>
                </TableCell>
                <TableCell>{row.employee.position ?? "—"}</TableCell>
                {metricKeys.map((key) => {
                  const kpi = findKpi(row, key);
                  if (!kpi) return <TableCell key={key}>—</TableCell>;
                  const progress =
                    kpi.target && kpi.target > 0
                      ? Math.round((kpi.value / kpi.target) * 100)
                      : null;
                  return (
                    <TableCell key={key}>
                      <div className="text-sm">
                        {kpi.value}
                        {kpi.target != null && (
                          <span className="text-muted-foreground"> / {kpi.target}</span>
                        )}
                      </div>
                      {progress != null && (
                        <Badge variant={progress >= 100 ? "default" : "secondary"} className="mt-1">
                          {progress}%
                        </Badge>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell>
                  {row.efficiency != null ? (
                    <Badge variant={row.efficiency >= 100 ? "default" : "outline"}>
                      {row.efficiency}%
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
