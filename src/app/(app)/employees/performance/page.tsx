import { Suspense } from "react";
import { getPerformanceTable } from "@/app/actions/employees";
import { PerformanceTable } from "@/components/employees/performance-table";

type PerformancePageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PerformancePage({ searchParams }: PerformancePageProps) {
  const params = await searchParams;
  const { rows, month, metricKeys } = await getPerformanceTable(params.month);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <PerformanceTable rows={rows} month={month} metricKeys={metricKeys} />
    </Suspense>
  );
}
