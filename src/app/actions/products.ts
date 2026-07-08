"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import {
  fallbackProductDescription,
  generateProductDescriptionWithClaude,
} from "@/lib/claude/product-description";
import { pickFormData } from "@/lib/crud/utils";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { CrudActionResult, CrudFilters, Product } from "@/types/database";

async function requireCompanyContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

function computeMargin(cost: number | null, price: number | null) {
  if (cost == null || price == null || price === 0) return null;
  return Number((((price - cost) / price) * 100).toFixed(2));
}

export async function listProducts(filters: CrudFilters = {}) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("created_at", { ascending: false });

  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.q) query = query.ilike("name", `%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function createProduct(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "name",
    "type",
    "sku",
    "cost",
    "price",
    "margin_percent",
    "description",
    "status",
  ]);

  const cost = data.cost ? Number(data.cost) : null;
  const price = data.price ? Number(data.price) : null;
  const marginPercent = data.margin_percent
    ? Number(data.margin_percent)
    : computeMargin(cost, price);

  const { error } = await supabase.from("products").insert({
    company_id: ctx.company.id,
    name: data.name,
    type: data.type || "product",
    sku: data.sku || null,
    cost,
    price,
    margin_percent: marginPercent,
    description: data.description || null,
    status: data.status || "active",
  });

  if (error) return { error: error.message };
  revalidatePath("/products");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "name",
    "type",
    "sku",
    "cost",
    "price",
    "margin_percent",
    "description",
    "status",
  ]);

  const cost = data.cost ? Number(data.cost) : null;
  const price = data.price ? Number(data.price) : null;
  const marginPercent = data.margin_percent
    ? Number(data.margin_percent)
    : computeMargin(cost, price);

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      type: data.type || "product",
      sku: data.sku || null,
      cost,
      price,
      margin_percent: marginPercent,
      description: data.description || null,
      status: data.status || "active",
    })
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/products");
  return { success: true };
}

export async function deleteProduct(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/products");
  return { success: true };
}

export async function generateDescriptionFromForm(
  formData: FormData,
): Promise<{ description?: string; error?: string }> {
  const ctx = await requireCompanyContext();
  const data = pickFormData(formData, ["name", "type", "sku", "cost", "price"]);

  if (!data.name) return { error: "Укажите название товара" };

  const input = {
    name: data.name,
    type: (data.type || "product") as "product" | "service",
    sku: data.sku || null,
    cost: data.cost ? Number(data.cost) : null,
    price: data.price ? Number(data.price) : null,
  };

  const description =
    (await generateProductDescriptionWithClaude(input, ctx.company.name)) ??
    fallbackProductDescription(input);

  return { description };
}

export async function generateAndSaveDescription(productId: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("id", productId)
    .single();

  if (fetchError || !product) return { error: fetchError?.message ?? "Товар не найден" };

  const input = {
    name: product.name,
    type: product.type as "product" | "service",
    sku: product.sku,
    cost: product.cost,
    price: product.price,
  };

  const description =
    (await generateProductDescriptionWithClaude(input, ctx.company.name)) ??
    fallbackProductDescription(input);

  const { error } = await supabase
    .from("products")
    .update({ description })
    .eq("id", productId)
    .eq("company_id", ctx.company.id);

  if (error) return { error: error.message };
  revalidatePath("/products");
  return { success: true };
}
