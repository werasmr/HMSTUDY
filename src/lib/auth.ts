import { createClient } from "@/lib/supabase/server";
import type { Company, CompanyMember, Profile, UserContext } from "@/types/database";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function profileFromAuthUser(user: {
  id: string;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
  user_metadata?: Record<string, unknown>;
}): Profile {
  const now = new Date().toISOString();
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: null,
    created_at: user.created_at ?? now,
    updated_at: user.updated_at ?? user.created_at ?? now,
  };
}

export async function getUserContext(): Promise<UserContext | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    const profile = profileRow ?? profileFromAuthUser(user);

    const { data: membership } = await supabase
      .from("company_members")
      .select("*, companies(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) return null;

    let company = membership.companies as Company | null;
    if (!company) {
      const { data: companyRow } = await supabase
        .from("companies")
        .select("*")
        .eq("id", membership.company_id)
        .maybeSingle<Company>();
      company = companyRow;
    }

    if (!company) return null;

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
      company,
    };
  } catch {
    return null;
  }
}

export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return base || "company";
}
