import { Suspense } from "react";
import { getFinanceSummary } from "@/app/actions/finance";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { MonthFilter } from "@/components/finance/month-filter";

type FinancePageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const params = await searchParams;
  const month = params.month ?? new Date().toISOString().slice(0, 7);
  const summary = await getFinanceSummary(month);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <MonthFilter />
      </Suspense>
      <FinanceDashboard summary={summary} month={month} />
    </div>
  );
}
