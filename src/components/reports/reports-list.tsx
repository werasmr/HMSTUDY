"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDailyReport, generateDailyReport } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DailyReport } from "@/types/database";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

type ReportsListProps = {
  reports: DailyReport[];
};

export function ReportsList({ reports }: ReportsListProps) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    reports[0]?.id ?? null,
  );

  const selected = reports.find((report) => report.id === selectedId) ?? null;
  const today = new Date().toISOString().slice(0, 10);
  const hasToday = reports.some((report) => report.report_date === today);

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateDailyReport();
    setGenerating(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Отчёт готов");
    if (result.report) setSelectedId(result.report.id);
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Удалить отчёт?")) return;
    const result = await deleteDailyReport(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (selectedId === id) setSelectedId(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => void handleGenerate()} disabled={generating || refreshing}>
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {hasToday ? "Обновить отчёт за сегодня" : "Сгенерировать отчёт за сегодня"}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Отчётов пока нет</p>
            <p className="text-sm text-muted-foreground">
              AI CEO соберёт финансы, клиентов, задачи и KPI команды в один ежедневный отчёт.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">История</CardTitle>
              <CardDescription>Последние 30 отчётов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "flex items-center gap-1 rounded-lg border px-2 py-1.5",
                    selectedId === report.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-transparent hover:bg-muted/50",
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-sm"
                    onClick={() => setSelectedId(report.id)}
                  >
                    {formatDate(report.report_date)}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => void handleDelete(report.id)}
                    aria-label="Удалить"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {selected ? `Отчёт за ${formatDate(selected.report_date)}` : "Выберите отчёт"}
                  </CardTitle>
                  {selected && (
                    <p className="text-sm text-muted-foreground">
                      Сформирован AI CEO на основе данных компании
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {selected ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selected.content}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Выберите отчёт из списка слева.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
