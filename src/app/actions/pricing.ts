"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import {
  fallbackPriceRecommendation,
  recommendPriceWithClaude,
} from "@/lib/claude/pricing";
import { calculatePrice, pickFormData } from "@/lib/crud/utils";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { CrudActionResult, PricingScenario } from "@/types/database";

async function requireCompanyContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

async function getCompetitorContext(productId?: string | null, productName?: string | null) {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  let name = productName ?? null;
  if (productId) {
    const { data: product } = await supabase
      .from("products")
      .select("name")
      .eq("company_id", ctx.company.id)
      .eq("id", productId)
      .maybeSingle();
    name = product?.name ?? name;
  }

  const { data: items } = await supabase
    .from("competitor_items")
    .select("product_name, price, competitors(name)")
    .eq("company_id", ctx.company.id);

  const competitorPrices = (items ?? [])
    .filter((item) => {
      if (!name) return true;
      return normalizeName(item.product_name) === normalizeName(name);
    })
    .map((item) => {
      const competitor = Array.isArray(item.competitors) ? item.competitors[0] : item.competitors;
      return {
        competitorName: (competitor as { name: string } | null)?.name ?? "Конкурент",
        price: Number(item.price),
      };
    });

  return { competitorPrices, productName: name };
}

export async function listPricingScenarios() {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("pricing_scenarios")
    .select("*, products(name)")
    .eq("company_id", ctx.company.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []) as PricingScenario[];
}

export async function listProductOptions() {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, cost, price, margin_percent")
    .eq("company_id", ctx.company.id)
    .eq("status", "active")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function recommendPrice(formData: FormData) {
  const ctx = await requireCompanyContext();
  const data = pickFormData(formData, ["product_id", "cost", "margin_percent"]);

  const cost = Number(data.cost);
  const marginPercent = Number(data.margin_percent || 0);

  if (!cost || cost <= 0) return { error: "Укажите корректную себестоимость" };

  const calculatedPrice = calculatePrice(cost, marginPercent);
  const { competitorPrices, productName } = await getCompetitorContext(
    data.product_id || null,
    null,
  );

  const input = {
    productName,
    cost,
    marginPercent,
    calculatedPrice,
    currency: ctx.company.settings.currency,
    competitorPrices,
  };

  const recommendation =
    (await recommendPriceWithClaude(input)) ?? fallbackPriceRecommendation(input);

  return {
    calculatedPrice,
    aiRecommendedPrice: recommendation.recommendedPrice,
    aiReasoning: recommendation.reasoning,
    competitorContext: { competitorPrices },
  };
}

export async function savePricingScenario(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();
  const data = pickFormData(formData, [
    "product_id",
    "cost",
    "margin_percent",
    "calculated_price",
    "ai_recommended_price",
    "ai_reasoning",
  ]);

  const cost = Number(data.cost);
  const marginPercent = Number(data.margin_percent);
  const calculatedPrice = Number(data.calculated_price || calculatePrice(cost, marginPercent));

  const { competitorPrices } = await getCompetitorContext(data.product_id || null, null);

  const { error } = await supabase.from("pricing_scenarios").insert({
    company_id: ctx.company.id,
    product_id: data.product_id || null,
    cost,
    margin_percent: marginPercent,
    calculated_price: calculatedPrice,
    ai_recommended_price: data.ai_recommended_price ? Number(data.ai_recommended_price) : null,
    ai_reasoning: data.ai_reasoning || null,
    competitor_context: { competitorPrices },
    created_by: ctx.profile.id,
  });

  if (error) return { error: error.message };

  if (data.product_id && data.ai_recommended_price) {
    await supabase
      .from("products")
      .update({
        cost,
        margin_percent: marginPercent,
        price: Number(data.ai_recommended_price),
      })
      .eq("company_id", ctx.company.id)
      .eq("id", data.product_id);
  }

  revalidatePath("/pricing");
  revalidatePath("/products");
  return { success: true };
}

export async function deletePricingScenario(id: string): Promise<CrudActionResult> {
  const ctx = await requireCompanyContext();
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("pricing_scenarios")
    .delete()
    .eq("company_id", ctx.company.id)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/pricing");
  return { success: true };
}
