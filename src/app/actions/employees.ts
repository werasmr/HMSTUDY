"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import { pickFormData } from "@/lib/crud/utils";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type {
  CrudActionResult,
  CrudFilters,
  Employee,
  EmployeeKpi,
  PerformanceRow,
} from "@/types/database";

async function requireCompanyContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

function monthToPeriod(month: string) {
  const [year, monthValue] = month.split("-").map(Number);
  return new Date(year, monthValue - 1, 1).toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function calcEfficiency(kpis: EmployeeKpi[]) {
  const withTarget = kpis.filter((kpi) => kpi.target && kpi.target > 0);
  if (withTarget.length === 0) return null;

  const total = withTarget.reduce((sum, kpi) => sum + (kpi.value / kpi.target!) * 100, 0);
  return Math.round(total / withTarget.length);
}

export async function listEmployees(filters: CrudFilters = {}) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("employees")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("full_name");

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.q) {
    query = query.or(
      `full_name.ilike.%${filters.q}%,position.ilike.%${filters.q}%,department.ilike.%${filters.q}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Employee[];
}

export async function getEmployee(id: string) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Employee;
}

export async function createEmployee(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["full_name", "position", "department", "hire_date", "status"]);

  const { error } = await supabase.from("employees").insert({
    company_id: ctx.company.id,
    full_name: data.full_name,
    position: data.position || null,
    department: data.department || null,
    hire_date: data.hire_date || null,
    status: data.status || "active",
  });

  if (error) return { error: error.message };
  revalidatePath("/employees");
  revalidatePath("/employees/performance");
  return { success: true };
}

export async function updateEmployee(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["full_name", "position", "department", "hire_date", "status"]);

  const { error } = await supabase
    .from("employees")
    .update({
      full_name: data.full_name,
      position: data.position || null,
      department: data.department || null,
      hire_date: data.hire_date || null,
      status: data.status || "active",
    })
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  revalidatePath("/employees/performance");
  return { success: true };
}

export async function deleteEmployee(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/employees");
  revalidatePath("/employees/performance");
  return { success: true };
}

export async function listEmployeeKpis(employeeId: string, month?: string) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("employee_kpis")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("employee_id", employeeId)
    .order("period", { ascending: false });

  if (month) {
    query = query.eq("period", monthToPeriod(month));
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as EmployeeKpi[];
}

export async function upsertEmployeeKpi(
  employeeId: string,
  formData: FormData,
): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["period", "metric_key", "metric_label", "value", "target"]);

  const period = data.period.length === 7 ? monthToPeriod(data.period) : data.period;
  const value = Number(data.value || 0);
  const target = data.target ? Number(data.target) : null;

  const { error } = await supabase.from("employee_kpis").upsert(
    {
      company_id: ctx.company.id,
      employee_id: employeeId,
      period,
      metric_key: data.metric_key,
      metric_label: data.metric_label,
      value,
      target,
    },
    { onConflict: "employee_id,period,metric_key" },
  );

  if (error) return { error: error.message };
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath("/employees/performance");
  return { success: true };
}

export async function deleteEmployeeKpi(kpiId: string, employeeId: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("employee_kpis")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", kpiId);

  if (error) return { error: error.message };
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath("/employees/performance");
  return { success: true };
}

export async function getPerformanceTable(month?: string): Promise<{
  rows: PerformanceRow[];
  month: string;
  metricKeys: string[];
}> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const selectedMonth = month ?? currentMonth();
  const period = monthToPeriod(selectedMonth);

  const [employeesResult, kpisResult] = await Promise.all([
    supabase
      .from("employees")
      .select("*")
      .eq("company_id", ctx.company.id)
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("employee_kpis")
      .select("*")
      .eq("company_id", ctx.company.id)
      .eq("period", period),
  ]);

  if (employeesResult.error) throw new Error(employeesResult.error.message);
  if (kpisResult.error) throw new Error(kpisResult.error.message);

  const employees = (employeesResult.data ?? []) as Employee[];
  const kpis = (kpisResult.data ?? []) as EmployeeKpi[];
  const metricKeys = Array.from(new Set(kpis.map((kpi) => kpi.metric_key))).sort();

  const rows: PerformanceRow[] = employees.map((employee) => {
    const employeeKpis = kpis.filter((kpi) => kpi.employee_id === employee.id);
    return {
      employee,
      kpis: employeeKpis,
      efficiency: calcEfficiency(employeeKpis),
    };
  });

  return { rows, month: selectedMonth, metricKeys };
}
