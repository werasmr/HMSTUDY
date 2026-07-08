"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import { pickFormData } from "@/lib/crud/utils";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type {
  ComparisonRow,
  Competitor,
  CompetitorItem,
  CrudActionResult,
  CrudFilters,
  Product,
} from "@/types/database";

async function requireCompanyContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export async function listCompetitors(filters: CrudFilters = {}) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("competitors")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("name");

  if (filters.q) query = query.ilike("name", `%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Competitor[];
}

export async function getCompetitor(id: string) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("competitors")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Competitor;
}

export async function createCompetitor(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["name", "website", "notes"]);

  const { error } = await supabase.from("competitors").insert({
    company_id: ctx.company.id,
    name: data.name,
    website: data.website || null,
    notes: data.notes || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/competitors");
  revalidatePath("/competitors/compare");
  return { success: true };
}

export async function updateCompetitor(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["name", "website", "notes"]);

  const { error } = await supabase
    .from("competitors")
    .update({
      name: data.name,
      website: data.website || null,
      notes: data.notes || null,
    })
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/competitors");
  revalidatePath(`/competitors/${id}`);
  revalidatePath("/competitors/compare");
  return { success: true };
}

export async function deleteCompetitor(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("competitors")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/competitors");
  revalidatePath("/competitors/compare");
  return { success: true };
}

export async function listCompetitorItems(competitorId: string) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("competitor_items")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("competitor_id", competitorId)
    .order("recorded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CompetitorItem[];
}

export async function createCompetitorItem(
  competitorId: string,
  formData: FormData,
): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["product_name", "price", "currency", "recorded_at", "notes"]);

  const { error } = await supabase.from("competitor_items").insert({
    company_id: ctx.company.id,
    competitor_id: competitorId,
    product_name: data.product_name,
    price: Number(data.price),
    currency: data.currency || ctx.company.settings.currency,
    recorded_at: data.recorded_at || new Date().toISOString().slice(0, 10),
    notes: data.notes || null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/competitors/${competitorId}`);
  revalidatePath("/competitors/compare");
  return { success: true };
}

export async function updateCompetitorItem(
  competitorId: string,
  itemId: string,
  formData: FormData,
): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, ["product_name", "price", "currency", "recorded_at", "notes"]);

  const { error } = await supabase
    .from("competitor_items")
    .update({
      product_name: data.product_name,
      price: Number(data.price),
      currency: data.currency || ctx.company.settings.currency,
      recorded_at: data.recorded_at || new Date().toISOString().slice(0, 10),
      notes: data.notes || null,
    })
    .eq("company_id", ctx.company.id)
    .eq("competitor_id", competitorId)
    .eq("id", itemId);

  if (error) return { error: error.message };
  revalidatePath(`/competitors/${competitorId}`);
  revalidatePath("/competitors/compare");
  return { success: true };
}

export async function deleteCompetitorItem(
  competitorId: string,
  itemId: string,
): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("competitor_items")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("competitor_id", competitorId)
    .eq("id", itemId);

  if (error) return { error: error.message };
  revalidatePath(`/competitors/${competitorId}`);
  revalidatePath("/competitors/compare");
  return { success: true };
}

export async function getComparisonTable(): Promise<{
  rows: ComparisonRow[];
  competitors: Competitor[];
  currency: string;
}> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const [competitorsResult, itemsResult, productsResult] = await Promise.all([
    supabase
      .from("competitors")
      .select("*")
      .eq("company_id", ctx.company.id)
      .order("name"),
    supabase
      .from("competitor_items")
      .select("*, competitors(name)")
      .eq("company_id", ctx.company.id),
    supabase
      .from("products")
      .select("*")
      .eq("company_id", ctx.company.id)
      .eq("status", "active"),
  ]);

  if (competitorsResult.error) throw new Error(competitorsResult.error.message);
  if (itemsResult.error) throw new Error(itemsResult.error.message);
  if (productsResult.error) throw new Error(productsResult.error.message);

  const competitors = (competitorsResult.data ?? []) as Competitor[];
  const items = (itemsResult.data ?? []) as CompetitorItem[];
  const products = (productsResult.data ?? []) as Product[];

  const productNames = new Set<string>();

  for (const product of products) {
    productNames.add(normalizeName(product.name));
  }
  for (const item of items) {
    productNames.add(normalizeName(item.product_name));
  }

  const rows: ComparisonRow[] = Array.from(productNames)
    .sort()
    .map((normalized) => {
      const ourProduct = products.find((product) => normalizeName(product.name) === normalized);
      const displayName = ourProduct?.name ?? items.find((item) => normalizeName(item.product_name) === normalized)?.product_name ?? normalized;

      return {
        productName: displayName,
        ourPrice: ourProduct?.price ?? null,
        ourProductId: ourProduct?.id ?? null,
        competitorPrices: competitors.map((competitor) => {
          const match = items
            .filter((item) => item.competitor_id === competitor.id)
            .find((item) => normalizeName(item.product_name) === normalized);

          return {
            competitorId: competitor.id,
            competitorName: competitor.name,
            price: match?.price ?? null,
            currency: match?.currency ?? ctx.company.settings.currency,
            itemId: match?.id ?? null,
          };
        }),
      };
    });

  return {
    rows,
    competitors,
    currency: ctx.company.settings.currency,
  };
}
