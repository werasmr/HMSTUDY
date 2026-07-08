"use server";

import { getFinanceSummary } from "@/app/actions/finance";
import { getUserContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type DashboardOverview = {
  counts: {
    clients: number;
    deals: number;
    openTasks: number;
    products: number;
    employees: number;
    transactionsThisMonth: number;
  };
  finance: {
    balance: number;
    income: number;
    expense: number;
    currency: string;
  };
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");

  const supabase = await createClient();
  const companyId = ctx.company.id;
  const month = new Date().toISOString().slice(0, 7);
  const monthStart = `${month}-01`;
  const monthEnd = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)),
    0,
  )
    .toISOString()
    .slice(0, 10);

  const [
    clientsResult,
    dealsResult,
    tasksResult,
    productsResult,
    employeesResult,
    transactionsResult,
    finance,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .is("duplicate_of", null),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .in("status", ["todo", "in_progress"]),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("transaction_date", monthStart)
      .lte("transaction_date", monthEnd),
    getFinanceSummary(month),
  ]);

  return {
    counts: {
      clients: clientsResult.count ?? 0,
      deals: dealsResult.count ?? 0,
      openTasks: tasksResult.count ?? 0,
      products: productsResult.count ?? 0,
      employees: employeesResult.count ?? 0,
      transactionsThisMonth: transactionsResult.count ?? 0,
    },
    finance: {
      balance: finance.balance,
      income: finance.income,
      expense: finance.expense,
      currency: finance.currency,
    },
  };
}
