"use server";

import { getDashboardOverview } from "@/app/actions/dashboard";
import { getPerformanceTable } from "@/app/actions/employees";
import { getUserContext } from "@/lib/auth";
import { getBusinessType } from "@/lib/business-types";
import { createClient } from "@/lib/supabase/server";
import type { ExecutiveSnapshot } from "@/lib/ai/executive";
import { formatMoney } from "@/lib/crud/utils";

const UNDERPERFORMER_THRESHOLD = 80;

export type BusinessIssue = {
  severity: "danger" | "warning";
  text: string;
};

export type BusinessHealth = {
  snapshot: ExecutiveSnapshot;
  issues: BusinessIssue[];
};

export async function getBusinessHealth(): Promise<BusinessHealth> {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");

  const supabase = await createClient();
  const month = new Date().toISOString().slice(0, 7);

  const [overview, performance, topClientsResult] = await Promise.all([
    getDashboardOverview(),
    getPerformanceTable(month).catch(() => ({ rows: [], month, metricKeys: [] })),
    supabase
      .from("clients")
      .select("name, total_purchases, segment")
      .eq("company_id", ctx.company.id)
      .is("duplicate_of", null)
      .order("total_purchases", { ascending: false })
      .limit(5),
  ]);

  const underperformers = performance.rows
    .filter((row) => row.efficiency !== null && row.efficiency < UNDERPERFORMER_THRESHOLD)
    .map((row) => ({
      name: row.employee.full_name,
      position: row.employee.position,
      efficiency: row.efficiency as number,
    }))
    .sort((a, b) => a.efficiency - b.efficiency);

  const issues: BusinessIssue[] = [];
  const currency = overview.finance.currency;

  if (overview.finance.balance < 0) {
    issues.push({
      severity: "danger",
      text: `Убыток за месяц: ${formatMoney(overview.finance.balance, currency)} — расходы превышают доходы.`,
    });
  }
  if (overview.finance.income === 0 && overview.finance.expense > 0) {
    issues.push({
      severity: "danger",
      text: "В этом месяце нет доходов, но есть расходы.",
    });
  }
  for (const employee of underperformers.slice(0, 3)) {
    issues.push({
      severity: employee.efficiency < 50 ? "danger" : "warning",
      text: `${employee.name}${employee.position ? ` (${employee.position})` : ""} выполняет план на ${employee.efficiency}%.`,
    });
  }
  if (overview.counts.openTasks > 10) {
    issues.push({
      severity: "warning",
      text: `Скопилось ${overview.counts.openTasks} открытых задач.`,
    });
  }
  if (overview.counts.transactionsThisMonth === 0) {
    issues.push({
      severity: "warning",
      text: "В этом месяце нет ни одной финансовой операции — данные не загружены.",
    });
  }

  const businessType = getBusinessType(ctx.company.business_type);

  const snapshot: ExecutiveSnapshot = {
    companyName: ctx.company.name,
    businessTypeLabel: businessType.label,
    aiFocus: businessType.aiFocus,
    currency,
    month,
    revenue: overview.finance.income,
    expense: overview.finance.expense,
    profit: overview.finance.balance,
    clients: overview.counts.clients,
    deals: overview.counts.deals,
    openTasks: overview.counts.openTasks,
    employees: overview.counts.employees,
    transactionsThisMonth: overview.counts.transactionsThisMonth,
    topClients: (topClientsResult.data ?? []).map((client) => ({
      name: client.name,
      total_purchases: Number(client.total_purchases ?? 0),
      segment: client.segment,
    })),
    underperformers,
    issues: issues.map((issue) => issue.text),
  };

  return { snapshot, issues };
}
