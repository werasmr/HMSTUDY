"use server";

import { revalidatePath } from "next/cache";
import { getBusinessHealth } from "@/app/actions/business";
import { getUserContext } from "@/lib/auth";
import { generateDailyReportText } from "@/lib/ai/executive";
import { createClient } from "@/lib/supabase/server";
import type { CrudActionResult, DailyReport } from "@/types/database";

async function requireContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

export async function listDailyReports(): Promise<DailyReport[]> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("report_date", { ascending: false })
    .limit(30);

  if (error) return [];
  return (data ?? []) as DailyReport[];
}

export async function generateDailyReport(): Promise<
  CrudActionResult & { report?: DailyReport }
> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { snapshot } = await getBusinessHealth();
  const content = await generateDailyReportText(snapshot);

  const { data, error } = await supabase
    .from("daily_reports")
    .upsert(
      {
        company_id: ctx.company.id,
        report_date: today,
        content,
        metrics: {
          revenue: snapshot.revenue,
          expense: snapshot.expense,
          profit: snapshot.profit,
          clients: snapshot.clients,
          deals: snapshot.deals,
          openTasks: snapshot.openTasks,
          employees: snapshot.employees,
          issues: snapshot.issues,
          currency: snapshot.currency,
        },
        generated_by: ctx.profile.id,
      },
      { onConflict: "company_id,report_date" },
    )
    .select("*")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/reports");
  return { success: true, report: data as DailyReport };
}

export async function deleteDailyReport(id: string): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("daily_reports")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/reports");
  return { success: true };
}
