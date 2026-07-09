"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import { pickFormData } from "@/lib/crud/utils";
import { createClient } from "@/lib/supabase/server";
import type {
  Channel,
  CrudActionResult,
  CrudFilters,
  InboxMessage,
} from "@/types/database";

async function requireContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

export async function listChannels(): Promise<Channel[]> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("company_id", ctx.company.id)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Channel[];
}

export async function createChannel(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const data = pickFormData(formData, ["name", "type", "status"]);

  const { error } = await supabase.from("channels").insert({
    company_id: ctx.company.id,
    name: data.name,
    type: data.type || "telegram",
    status: data.status || "disabled",
    config: {},
  });

  if (error) return { error: error.message };
  revalidatePath("/inbox/channels");
  revalidatePath("/inbox");
  return { success: true };
}

export async function updateChannel(id: string, formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const data = pickFormData(formData, ["name", "type", "status"]);

  const { error } = await supabase
    .from("channels")
    .update({
      name: data.name,
      type: data.type,
      status: data.status,
    })
    .eq("id", id)
    .eq("company_id", ctx.company.id);

  if (error) return { error: error.message };
  revalidatePath("/inbox/channels");
  revalidatePath("/inbox");
  return { success: true };
}

export async function deleteChannel(id: string): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("channels")
    .delete()
    .eq("id", id)
    .eq("company_id", ctx.company.id);
  if (error) return { error: error.message };
  revalidatePath("/inbox/channels");
  revalidatePath("/inbox");
  return { success: true };
}

export async function listInboxMessages(filters: CrudFilters = {}): Promise<InboxMessage[]> {
  const ctx = await requireContext();
  const supabase = await createClient();

  let query = supabase
    .from("inbox_messages")
    .select("*, channels(name), clients(name)")
    .eq("company_id", ctx.company.id)
    .order("received_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.q) {
    const value = `%${filters.q}%`;
    query = query.or(`from_contact.ilike.${value},body.ilike.${value},subject.ilike.${value}`);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as InboxMessage[];
}

export async function createInboxMessage(formData: FormData): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const data = pickFormData(formData, [
    "channel_id",
    "client_id",
    "direction",
    "from_contact",
    "subject",
    "body",
    "status",
  ]);

  const { error } = await supabase.from("inbox_messages").insert({
    company_id: ctx.company.id,
    channel_id: data.channel_id,
    client_id: data.client_id || null,
    direction: data.direction || "inbound",
    from_contact: data.from_contact,
    subject: data.subject || null,
    body: data.body,
    status: data.status || "new",
  });

  if (error) return { error: error.message };
  revalidatePath("/inbox");
  return { success: true };
}

export async function updateInboxMessage(
  id: string,
  formData: FormData,
): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const data = pickFormData(formData, [
    "channel_id",
    "client_id",
    "direction",
    "from_contact",
    "subject",
    "body",
    "status",
  ]);

  const updates: Record<string, unknown> = {
    channel_id: data.channel_id,
    client_id: data.client_id || null,
    direction: data.direction,
    from_contact: data.from_contact,
    subject: data.subject || null,
    body: data.body,
    status: data.status,
  };

  if (data.status === "sent") {
    updates.sent_at = new Date().toISOString();
    updates.approved_by = ctx.profile.id;
  }

  const { error } = await supabase
    .from("inbox_messages")
    .update(updates)
    .eq("id", id)
    .eq("company_id", ctx.company.id);

  if (error) return { error: error.message };
  revalidatePath("/inbox");
  return { success: true };
}

export async function deleteInboxMessage(id: string): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("inbox_messages")
    .delete()
    .eq("id", id)
    .eq("company_id", ctx.company.id);
  if (error) return { error: error.message };
  revalidatePath("/inbox");
  return { success: true };
}

export async function listChannelOptions() {
  const channels = await listChannels();
  return channels.map((c) => ({ value: c.id, label: c.name }));
}

export async function listClientOptionsForInbox() {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, name")
    .eq("company_id", ctx.company.id)
    .is("duplicate_of", null)
    .order("name")
    .limit(200);
  return (data ?? []).map((c) => ({ value: c.id, label: c.name }));
}
