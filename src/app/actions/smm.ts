"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import { pickFormData } from "@/lib/crud/utils";
import { createClient } from "@/lib/supabase/server";
import type {
  CrudActionResult,
  CrudFilters,
  SocialAccount,
  SocialPost,
} from "@/types/database";

async function requireContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

export async function listSocialAccounts(): Promise<SocialAccount[]> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as SocialAccount[];
}

export async function createSocialAccount(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const data = pickFormData(formData, ["name", "platform", "status"]);

  const { error } = await supabase.from("social_accounts").insert({
    company_id: ctx.company.id,
    name: data.name,
    platform: data.platform || "telegram",
    status: data.status || "disabled",
    config: {},
  });

  if (error) return { error: error.message };
  revalidatePath("/smm/accounts");
  revalidatePath("/smm");
  return { success: true };
}

export async function updateSocialAccount(
  id: string,
  formData: FormData,
): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const data = pickFormData(formData, ["name", "platform", "status"]);

  const { error } = await supabase
    .from("social_accounts")
    .update({
      name: data.name,
      platform: data.platform,
      status: data.status,
    })
    .eq("id", id)
    .eq("company_id", ctx.company.id);

  if (error) return { error: error.message };
  revalidatePath("/smm/accounts");
  revalidatePath("/smm");
  return { success: true };
}

export async function deleteSocialAccount(id: string): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_accounts")
    .delete()
    .eq("id", id)
    .eq("company_id", ctx.company.id);
  if (error) return { error: error.message };
  revalidatePath("/smm/accounts");
  revalidatePath("/smm");
  return { success: true };
}

export async function listSocialPosts(filters: CrudFilters = {}): Promise<SocialPost[]> {
  const ctx = await requireContext();
  const supabase = await createClient();

  let query = supabase
    .from("social_posts")
    .select("*, social_accounts(name)")
    .eq("company_id", ctx.company.id)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as SocialPost[];
}

export async function createSocialPost(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const data = pickFormData(formData, ["social_account_id", "content", "scheduled_at", "status"]);

  const { error } = await supabase.from("social_posts").insert({
    company_id: ctx.company.id,
    social_account_id: data.social_account_id || null,
    content: data.content,
    scheduled_at: data.scheduled_at || null,
    status: data.status || "draft",
    created_by: ctx.profile.id,
    ai_generated: false,
  });

  if (error) return { error: error.message };
  revalidatePath("/smm");
  return { success: true };
}

export async function updateSocialPost(
  id: string,
  formData: FormData,
): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const data = pickFormData(formData, ["social_account_id", "content", "scheduled_at", "status"]);

  const updates: Record<string, unknown> = {
    social_account_id: data.social_account_id || null,
    content: data.content,
    scheduled_at: data.scheduled_at || null,
    status: data.status,
  };

  if (data.status === "published") {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("social_posts")
    .update(updates)
    .eq("id", id)
    .eq("company_id", ctx.company.id);

  if (error) return { error: error.message };
  revalidatePath("/smm");
  return { success: true };
}

export async function deleteSocialPost(id: string): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_posts")
    .delete()
    .eq("id", id)
    .eq("company_id", ctx.company.id);
  if (error) return { error: error.message };
  revalidatePath("/smm");
  return { success: true };
}

export async function listSocialAccountOptions() {
  const accounts = await listSocialAccounts();
  return accounts.map((a) => ({ value: a.id, label: a.name }));
}
