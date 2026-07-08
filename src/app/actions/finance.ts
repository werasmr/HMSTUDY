"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import {
  categorizeTransactionsWithClaude,
  fallbackCategorize,
} from "@/lib/claude/categorize";
import { pickFormData } from "@/lib/crud/utils";
import { parseStatementFile } from "@/lib/finance/statement-parser";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type {
  BankAccount,
  CrudActionResult,
  CrudFilters,
  FinanceSummary,
  Transaction,
  TransactionCategory,
} from "@/types/database";

async function requireCompanyContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

function getPeriodBounds(month?: string) {
  const now = new Date();
  const [year, monthValue] = (month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
    .split("-")
    .map(Number);

  const from = new Date(year, monthValue - 1, 1);
  const to = new Date(year, monthValue, 0);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export async function listBankAccounts() {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BankAccount[];
}

export async function createBankAccount(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["name", "currency"]);

  const { error } = await supabase.from("bank_accounts").insert({
    company_id: ctx.company.id,
    name: data.name,
    currency: data.currency || ctx.company.settings.currency,
  });

  if (error) return { error: error.message };
  revalidatePath("/finance/accounts");
  revalidatePath("/finance/transactions");
  return { success: true };
}

export async function updateBankAccount(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["name", "currency"]);

  const { error } = await supabase
    .from("bank_accounts")
    .update({
      name: data.name,
      currency: data.currency || ctx.company.settings.currency,
    })
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/finance/accounts");
  return { success: true };
}

export async function deleteBankAccount(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("bank_accounts")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/finance/accounts");
  return { success: true };
}

export async function listCategories() {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("transaction_categories")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("type")
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []) as TransactionCategory[];
}

export async function listTransactions(filters: CrudFilters = {}) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("transactions")
    .select("*, bank_accounts(name), transaction_categories(name, type)")
    .eq("company_id", ctx.company.id)
    .order("transaction_date", { ascending: false });

  if (filters.type === "income") query = query.gt("amount", 0);
  if (filters.type === "expense") query = query.lt("amount", 0);
  if (filters.categorized === "yes") query = query.not("category_id", "is", null);
  if (filters.categorized === "no") query = query.is("category_id", null);
  if (filters.q) query = query.ilike("description", `%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Transaction[];
}

export async function createTransaction(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "bank_account_id",
    "category_id",
    "amount",
    "transaction_date",
    "description",
  ]);

  const { error } = await supabase.from("transactions").insert({
    company_id: ctx.company.id,
    bank_account_id: data.bank_account_id || null,
    category_id: data.category_id || null,
    amount: Number(data.amount),
    currency: ctx.company.settings.currency,
    description: data.description,
    transaction_date: data.transaction_date,
  });

  if (error) return { error: error.message };
  revalidatePath("/finance");
  revalidatePath("/finance/transactions");
  return { success: true };
}

export async function updateTransaction(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "bank_account_id",
    "category_id",
    "amount",
    "transaction_date",
    "description",
  ]);

  const { error } = await supabase
    .from("transactions")
    .update({
      bank_account_id: data.bank_account_id || null,
      category_id: data.category_id || null,
      amount: Number(data.amount),
      description: data.description,
      transaction_date: data.transaction_date,
      ai_categorized: false,
      ai_confidence: null,
    })
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/finance");
  revalidatePath("/finance/transactions");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/finance");
  revalidatePath("/finance/transactions");
  return { success: true };
}

export async function importStatement(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const file = formData.get("file");
  const bankAccountId = String(formData.get("bank_account_id") ?? "");

  if (!(file instanceof File)) return { error: "Выберите файл выписки" };
  if (!bankAccountId) return { error: "Выберите банковский счёт" };

  const buffer = await file.arrayBuffer();
  const rows = parseStatementFile(file.name, buffer);

  if (rows.length === 0) {
    return { error: "Не удалось распознать транзакции. Проверьте колонки: дата, сумма, описание." };
  }

  const { data: job, error: jobError } = await supabase
    .from("import_jobs")
    .insert({
      company_id: ctx.company.id,
      module: "transactions",
      file_path: file.name,
      status: "processing",
      created_by: ctx.profile.id,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    return { error: jobError?.message ?? "Не удалось создать import job" };
  }

  const payload = rows.map((row) => ({
    company_id: ctx.company.id,
    bank_account_id: bankAccountId,
    amount: row.amount,
    currency: ctx.company.settings.currency,
    description: row.description,
    transaction_date: row.date,
    import_ref: row.importRef,
    metadata: { source: "statement", file: file.name },
  }));

  const importRefs = payload.map((row) => row.import_ref);
  const { data: existing } = await supabase
    .from("transactions")
    .select("import_ref")
    .eq("company_id", ctx.company.id)
    .in("import_ref", importRefs);

  const existingRefs = new Set((existing ?? []).map((row) => row.import_ref));
  const toInsert = payload.filter((row) => !existingRefs.has(row.import_ref));

  if (toInsert.length === 0) {
    await supabase
      .from("import_jobs")
      .update({
        status: "completed",
        stats: { imported: 0, parsed: rows.length, skipped: rows.length },
      })
      .eq("id", job.id);

    revalidatePath("/finance");
    revalidatePath("/finance/transactions");
    return { success: true };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("transactions")
    .insert(toInsert)
    .select("id, description, amount");

  await supabase
    .from("import_jobs")
    .update({
      status: insertError ? "failed" : "completed",
      stats: {
        imported: inserted?.length ?? 0,
        parsed: rows.length,
        skipped: rows.length - toInsert.length,
      },
      error_log: insertError?.message ?? null,
    })
    .eq("id", job.id);

  if (insertError) return { error: insertError.message };

  if (inserted && inserted.length > 0) {
    await autoCategorizeInserted(inserted);
  }

  revalidatePath("/finance");
  revalidatePath("/finance/transactions");
  return { success: true };
}

async function autoCategorizeInserted(
  transactions: Array<{ id: string; description: string; amount: number }>,
) {
  const categories = await listCategories();
  const assignments = process.env.ANTHROPIC_API_KEY
    ? await categorizeTransactionsWithClaude(transactions, categories)
    : fallbackCategorize(transactions, categories);

  const supabase = await createSupabaseClient();

  for (const assignment of assignments) {
    await supabase
      .from("transactions")
      .update({
        category_id: assignment.categoryId,
        ai_categorized: Boolean(process.env.ANTHROPIC_API_KEY),
        ai_confidence: assignment.confidence,
      })
      .eq("id", assignment.transactionId);
  }
}

export async function categorizeUncategorizedTransactions(): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("id, description, amount")
    .eq("company_id", ctx.company.id)
    .is("category_id", null)
    .limit(50);

  if (error) return { error: error.message };
  if (!transactions?.length) return { success: true };

  await autoCategorizeInserted(transactions);

  revalidatePath("/finance");
  revalidatePath("/finance/transactions");
  return { success: true };
}

export async function getFinanceSummary(month?: string): Promise<FinanceSummary> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const { from, to } = getPeriodBounds(month);

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("amount, category_id, transaction_categories(name, type)")
    .eq("company_id", ctx.company.id)
    .gte("transaction_date", from)
    .lte("transaction_date", to);

  if (error) throw new Error(error.message);

  let income = 0;
  let expense = 0;
  const categoryMap = new Map<string, FinanceSummary["byCategory"][number]>();

  for (const transaction of transactions ?? []) {
    const amount = Number(transaction.amount);
    if (amount >= 0) income += amount;
    else expense += Math.abs(amount);

    const category = Array.isArray(transaction.transaction_categories)
      ? transaction.transaction_categories[0]
      : transaction.transaction_categories;

    const key = transaction.category_id ?? "uncategorized";
    const existing = categoryMap.get(key) ?? {
      categoryId: transaction.category_id,
      categoryName: (category as { name: string } | null | undefined)?.name ?? "Без категории",
      type: (category as { type: "income" | "expense" } | null | undefined)?.type ?? "unknown",
      total: 0,
    };

    existing.total += amount;
    categoryMap.set(key, existing);
  }

  return {
    income,
    expense,
    balance: income - expense,
    currency: ctx.company.settings.currency,
    byCategory: Array.from(categoryMap.values()).sort((a, b) => Math.abs(b.total) - Math.abs(a.total)),
    periodFrom: from,
    periodTo: to,
  };
}

export async function listBankAccountOptions() {
  const accounts = await listBankAccounts();
  return accounts.map((account) => ({ value: account.id, label: account.name }));
}

export async function listCategoryOptions() {
  const categories = await listCategories();
  return categories.map((category) => ({
    value: category.id,
    label: `${category.name} (${category.type === "income" ? "доход" : "расход"})`,
  }));
}
