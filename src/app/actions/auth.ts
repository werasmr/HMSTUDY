"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_CATEGORIES = [
  { name: "Продажи", type: "income" as const },
  { name: "Услуги", type: "income" as const },
  { name: "Прочие доходы", type: "income" as const },
  { name: "Зарплата", type: "expense" as const },
  { name: "Аренда", type: "expense" as const },
  { name: "Маркетинг", type: "expense" as const },
  { name: "Закупки", type: "expense" as const },
  { name: "Прочие расходы", type: "expense" as const },
];

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Необходимо войти в систему" };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Укажите название компании" };
  }

  const businessType = String(formData.get("businessType") ?? "other").trim() || "other";
  const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`;

  const { data: companyId, error: companyError } = await supabase.rpc(
    "create_company_with_owner",
    {
      company_name: name,
      company_slug: slug,
    },
  );

  if (companyError || !companyId) {
    return { error: companyError?.message ?? "Не удалось создать компанию" };
  }

  await supabase
    .from("companies")
    .update({ business_type: businessType })
    .eq("id", companyId);

  await supabase.from("transaction_categories").insert(
    DEFAULT_CATEGORIES.map((category) => ({
      company_id: companyId,
      name: category.name,
      type: category.type,
      is_system: true,
    })),
  );

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateCompanySettings(formData: FormData) {
  const supabase = await createClient();
  const ctx = await import("@/lib/auth").then((m) => m.getUserContext());

  if (!ctx || ctx.membership.role !== "owner") {
    return { error: "Недостаточно прав" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const businessType = String(formData.get("businessType") ?? ctx.company.business_type ?? "other").trim();
  const currency = String(formData.get("currency") ?? "RUB").trim();
  const timezone = String(formData.get("timezone") ?? "Europe/Moscow").trim();
  const vip = Number(formData.get("segment_vip") ?? 100000);
  const regular = Number(formData.get("segment_regular") ?? 10000);
  const lowValue = Number(formData.get("segment_low_value") ?? 0);

  const { error } = await supabase
    .from("companies")
    .update({
      name,
      business_type: businessType,
      settings: {
        ...ctx.company.settings,
        currency,
        timezone,
        segment_thresholds: {
          vip,
          regular,
          low_value: lowValue,
        },
      },
    })
    .eq("id", ctx.company.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Необходимо войти в систему" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}
