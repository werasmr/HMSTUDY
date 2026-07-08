import { createClient } from "@/lib/supabase/server";
import type { Company, CompanyMember, Profile, UserContext } from "@/types/database";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) return null;

  const { data: membership } = await supabase
    .from("company_members")
    .select("*, companies(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership?.companies) return null;

  return {
    profile,
    membership: {
      id: membership.id,
      company_id: membership.company_id,
      user_id: membership.user_id,
      role: membership.role,
      status: membership.status,
      invited_email: membership.invited_email,
      created_at: membership.created_at,
    } as CompanyMember,
    company: membership.companies as Company,
  };
}

export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return base || "company";
}
