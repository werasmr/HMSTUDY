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

  const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`;

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({ name, slug })
    .select("id")
    .single();

  if (companyError || !company) {
    return { error: companyError?.message ?? "Не удалось создать компанию" };
  }

  const { error: memberError } = await supabase.from("company_members").insert({
    company_id: company.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });

  if (memberError) {
    return { error: memberError.message };
  }

  await supabase.from("transaction_categories").insert(
    DEFAULT_CATEGORIES.map((category) => ({
      company_id: company.id,
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
  const currency = String(formData.get("currency") ?? "RUB").trim();
  const timezone = String(formData.get("timezone") ?? "Europe/Moscow").trim();
  const vip = Number(formData.get("segment_vip") ?? 100000);
  const regular = Number(formData.get("segment_regular") ?? 10000);
  const lowValue = Number(formData.get("segment_low_value") ?? 0);

  const { error } = await supabase
    .from("companies")
    .update({
      name,
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
