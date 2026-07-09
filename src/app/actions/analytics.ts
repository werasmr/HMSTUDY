"use server";

import { getFinanceSummary } from "@/app/actions/finance";
import { getPerformanceTable } from "@/app/actions/employees";
import { getDashboardOverview } from "@/app/actions/dashboard";
import { getUserContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AnalyticsOverview = {
  month: string;
  currency: string;
  overview: Awaited<ReturnType<typeof getDashboardOverview>>;
  financeByCategory: Array<{ name: string; total: number }>;
  dealsByStage: Array<{ stage: string; count: number }>;
  avgTeamEfficiency: number;
  inboxNew: number;
  smmScheduled: number;
};

export async function getAnalyticsOverview(month?: string): Promise<AnalyticsOverview> {
  const selectedMonth = month ?? new Date().toISOString().slice(0, 7);

  const [overview, finance, performance, dealsByStage, inboxNew, smmScheduled] =
    await Promise.all([
      getDashboardOverview(),
      getFinanceSummary(selectedMonth).catch(() => null),
      getPerformanceTable(selectedMonth).catch(() => ({
        rows: [],
        month: selectedMonth,
        metricKeys: [],
      })),
      getDealsByStage(),
      getInboxNewCount(),
      getSmmScheduledCount(),
    ]);

  const efficiencies = performance.rows
    .map((row) => row.efficiency)
    .filter((value): value is number => value != null && value > 0);
  const avgTeamEfficiency =
    efficiencies.length > 0
      ? Math.round(efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length)
      : 0;

  return {
    month: selectedMonth,
    currency: finance?.currency ?? overview.finance.currency,
    overview,
    financeByCategory: (finance?.byCategory ?? []).map((item) => ({
      name: item.categoryName,
      total: item.total,
    })),
    dealsByStage,
    avgTeamEfficiency,
    inboxNew,
    smmScheduled,
  };
}

async function getDealsByStage() {
  try {
    const ctx = await getUserContext();
    if (!ctx) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("deals")
      .select("stage")
      .eq("company_id", ctx.company.id);

    if (error || !data) return [];

    const counts = new Map<string, number>();
    for (const deal of data) {
      counts.set(deal.stage, (counts.get(deal.stage) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([stage, count]) => ({ stage, count }));
  } catch {
    return [];
  }
}

async function getInboxNewCount() {
  try {
    const ctx = await getUserContext();
    if (!ctx) return 0;
    const supabase = await createClient();
    const { count } = await supabase
      .from("inbox_messages")
      .select("id", { count: "exact", head: true })
      .eq("company_id", ctx.company.id)
      .eq("status", "new");
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function getSmmScheduledCount() {
  try {
    const ctx = await getUserContext();
    if (!ctx) return 0;
    const supabase = await createClient();
    const { count } = await supabase
      .from("social_posts")
      .select("id", { count: "exact", head: true })
      .eq("company_id", ctx.company.id)
      .eq("status", "scheduled");
    return count ?? 0;
  } catch {
    return 0;
  }
}
