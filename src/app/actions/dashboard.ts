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

const EMPTY_OVERVIEW: DashboardOverview = {
  counts: {
    clients: 0,
    deals: 0,
    openTasks: 0,
    products: 0,
    employees: 0,
    transactionsThisMonth: 0,
  },
  finance: {
    balance: 0,
    income: 0,
    expense: 0,
    currency: "RUB",
  },
};

async function safeCount(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
) {
  try {
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  try {
    const ctx = await getUserContext();
    if (!ctx) return EMPTY_OVERVIEW;

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
      clients,
      deals,
      openTasks,
      products,
      employees,
      transactionsThisMonth,
      finance,
    ] = await Promise.all([
      safeCount(
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .is("duplicate_of", null),
      ),
      safeCount(
        supabase
          .from("deals")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId),
      ),
      safeCount(
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .in("status", ["todo", "in_progress"]),
      ),
      safeCount(
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId),
      ),
      safeCount(
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId),
      ),
      safeCount(
        supabase
          .from("transactions")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .gte("transaction_date", monthStart)
          .lte("transaction_date", monthEnd),
      ),
      getFinanceSummary(month).catch(() => ({
        balance: 0,
        income: 0,
        expense: 0,
        currency: ctx.company.settings?.currency ?? "RUB",
        byCategory: [],
        periodFrom: monthStart,
        periodTo: monthEnd,
      })),
    ]);

    return {
      counts: {
        clients,
        deals,
        openTasks,
        products,
        employees,
        transactionsThisMonth,
      },
      finance: {
        balance: finance.balance,
        income: finance.income,
        expense: finance.expense,
        currency: finance.currency,
      },
    };
  } catch {
    return EMPTY_OVERVIEW;
  }
}
