"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import { computeSegment, pickFormData } from "@/lib/crud/utils";
import { parseSpreadsheetRows } from "@/lib/crm/spreadsheet";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Client, CrudActionResult, CrudFilters, Deal, Task } from "@/types/database";

async function requireCompanyContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

function applySearch<T extends { or: (filter: string) => T }>(query: T, q?: string) {
  if (!q) return query;
  const value = `%${q}%`;
  return query.or(`name.ilike.${value},email.ilike.${value},phone.ilike.${value}`);
}

export async function listClients(filters: CrudFilters = {}) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("clients")
    .select("*")
    .eq("company_id", ctx.company.id)
    .is("duplicate_of", null)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.segment && filters.segment !== "all") {
    query = query.eq("segment", filters.segment);
  }

  query = applySearch(query, filters.q);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

export async function getClient(id: string) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Client;
}

export async function createClient(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "name",
    "email",
    "phone",
    "status",
    "source",
    "total_purchases",
    "notes",
  ]);

  const totalPurchases = Number(data.total_purchases || 0);
  const segment = computeSegment(totalPurchases, ctx.company.settings);

  const { error } = await supabase.from("clients").insert({
    company_id: ctx.company.id,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    status: data.status || "lead",
    source: data.source || null,
    total_purchases: totalPurchases,
    segment,
    notes: data.notes || null,
    created_by: ctx.profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/crm/clients");
  return { success: true };
}

export async function updateClient(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "name",
    "email",
    "phone",
    "status",
    "source",
    "total_purchases",
    "notes",
  ]);

  const totalPurchases = Number(data.total_purchases || 0);
  const segment = computeSegment(totalPurchases, ctx.company.settings);

  const { error } = await supabase
    .from("clients")
    .update({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status || "lead",
      source: data.source || null,
      total_purchases: totalPurchases,
      segment,
      notes: data.notes || null,
    })
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/crm/clients");
  revalidatePath(`/crm/clients/${id}`);
  return { success: true };
}

export async function deleteClient(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/crm/clients");
  return { success: true };
}

export async function listClientInteractions(clientId: string) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("client_interactions")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addClientInteraction(
  clientId: string,
  formData: FormData,
): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["type", "title", "content"]);

  const { error } = await supabase.from("client_interactions").insert({
    company_id: ctx.company.id,
    client_id: clientId,
    type: data.type || "note",
    title: data.title || null,
    content: data.content || null,
    created_by: ctx.profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath(`/crm/clients/${clientId}`);
  return { success: true };
}

export async function importClientsCsv(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Выберите CSV или Excel файл" };
  }

  const rows = await parseSpreadsheetRows(file);

  if (rows.length === 0) {
    return { error: "Файл пустой или неверного формата" };
  }

  const { data: job, error: jobError } = await supabase
    .from("import_jobs")
    .insert({
      company_id: ctx.company.id,
      module: "clients",
      file_path: file.name,
      status: "processing",
      created_by: ctx.profile.id,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    return { error: jobError?.message ?? "Не удалось создать import job" };
  }

  const payload = rows.flatMap((row) => {
    const name = row.name || row.имя || row.Name || row["Имя"];
    if (!name) return [];

    const totalPurchases = Number(row.total_purchases || row.purchases || row["Сумма покупок"] || 0);

    return [
      {
        company_id: ctx.company.id,
        name,
        email: row.email || row.Email || row["Email"] || null,
        phone: row.phone || row.Phone || row["Телефон"] || null,
        status: (row.status as Client["status"]) || "lead",
        source: row.source || row["Источник"] || "csv",
        total_purchases: totalPurchases,
        segment: computeSegment(totalPurchases, ctx.company.settings),
        created_by: ctx.profile.id,
        metadata: row,
      },
    ];
  });

  if (payload.length === 0) {
    await supabase
      .from("import_jobs")
      .update({ status: "failed", error_log: "Не найдена колонка name/имя" })
      .eq("id", job.id);
    return { error: "Не найдена колонка name/имя" };
  }

  const { error: insertError } = await supabase.from("clients").insert(payload);

  await supabase
    .from("import_jobs")
    .update({
      status: insertError ? "failed" : "completed",
      stats: {
        imported: insertError ? 0 : payload.length,
        skipped: rows.length - payload.length,
      },
      error_log: insertError?.message ?? null,
    })
    .eq("id", job.id);

  if (insertError) return { error: insertError.message };

  revalidatePath("/crm/clients");
  return { success: true };
}

export async function listDeals(filters: CrudFilters = {}) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("deals")
    .select("*, clients(name)")
    .eq("company_id", ctx.company.id)
    .order("created_at", { ascending: false });

  if (filters.stage && filters.stage !== "all") {
    query = query.eq("stage", filters.stage);
  }
  if (filters.q) {
    query = query.ilike("title", `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Deal[];
}

export async function createDeal(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "title",
    "client_id",
    "stage",
    "amount",
    "expected_close_date",
    "notes",
  ]);

  const { error } = await supabase.from("deals").insert({
    company_id: ctx.company.id,
    title: data.title,
    client_id: data.client_id,
    stage: data.stage || "lead",
    amount: data.amount ? Number(data.amount) : null,
    currency: ctx.company.settings.currency,
    expected_close_date: data.expected_close_date || null,
    notes: data.notes || null,
    assigned_to: ctx.profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/crm/deals");
  return { success: true };
}

export async function updateDeal(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "title",
    "client_id",
    "stage",
    "amount",
    "expected_close_date",
    "notes",
  ]);

  const { error } = await supabase
    .from("deals")
    .update({
      title: data.title,
      client_id: data.client_id,
      stage: data.stage || "lead",
      amount: data.amount ? Number(data.amount) : null,
      expected_close_date: data.expected_close_date || null,
      notes: data.notes || null,
    })
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/crm/deals");
  return { success: true };
}

export async function deleteDeal(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/crm/deals");
  return { success: true };
}

export async function listTasks(filters: CrudFilters = {}) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }
  if (filters.q) {
    query = query.ilike("title", `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function createTask(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "title",
    "description",
    "status",
    "priority",
    "due_date",
    "entity_type",
    "entity_id",
  ]);

  const { error } = await supabase.from("tasks").insert({
    company_id: ctx.company.id,
    title: data.title,
    description: data.description || null,
    status: data.status || "todo",
    priority: data.priority || "medium",
    due_date: data.due_date || null,
    entity_type: data.entity_type || "none",
    entity_id: data.entity_type === "none" ? null : data.entity_id || null,
    created_by: ctx.profile.id,
    assignee_id: ctx.profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/crm/tasks");
  return { success: true };
}

export async function updateTask(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "title",
    "description",
    "status",
    "priority",
    "due_date",
    "entity_type",
    "entity_id",
  ]);

  const { error } = await supabase
    .from("tasks")
    .update({
      title: data.title,
      description: data.description || null,
      status: data.status || "todo",
      priority: data.priority || "medium",
      due_date: data.due_date || null,
      entity_type: data.entity_type || "none",
      entity_id: data.entity_type === "none" ? null : data.entity_id || null,
    })
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/crm/tasks");
  return { success: true };
}

export async function deleteTask(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/crm/tasks");
  return { success: true };
}

export async function listClientOptions() {
  const clients = await listClients();
  return clients.map((client) => ({ value: client.id, label: client.name }));
}

export async function listDealOptions() {
  const deals = await listDeals();
  return deals.map((deal) => ({ value: deal.id, label: deal.title }));
}
