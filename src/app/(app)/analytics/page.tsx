import { Suspense } from "react";
import { getAnalyticsOverview } from "@/app/actions/analytics";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

type AnalyticsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const month = params.month ?? new Date().toISOString().slice(0, 7);
  const data = await getAnalyticsOverview(month);

  return (
    <Suspense fallback={null}>
      <AnalyticsDashboard data={data} />
    </Suspense>
  );
}
