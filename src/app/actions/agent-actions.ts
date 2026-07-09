"use server";

import { revalidatePath } from "next/cache";
import { getUserContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AgentAction, CrudActionResult } from "@/types/database";

async function requireContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

export async function listPendingAgentActions(): Promise<AgentAction[]> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_actions")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as AgentAction[];
}

export async function proposeAgentAction(input: {
  actionType: string;
  preview: string;
  payload: Record<string, unknown>;
  conversationId?: string;
}): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase.from("agent_actions").insert({
    company_id: ctx.company.id,
    conversation_id: input.conversationId ?? null,
    requested_by: ctx.profile.id,
    action_type: input.actionType,
    payload: input.payload,
    preview: input.preview,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath("/chat");
  return { success: true };
}

async function executeAction(action: AgentAction): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();

  if (action.action_type === "create_task") {
    const title = String(action.payload.title ?? "Новая задача");
    const { error } = await supabase.from("tasks").insert({
      company_id: ctx.company.id,
      title,
      description: String(action.payload.description ?? ""),
      status: "todo",
      priority: "medium",
      entity_type: "none",
      created_by: ctx.profile.id,
      assignee_id: ctx.profile.id,
    });
    if (error) return { error: error.message };
    return { success: true };
  }

  if (action.action_type === "create_social_post") {
    const content = String(action.payload.content ?? "");
    const { error } = await supabase.from("social_posts").insert({
      company_id: ctx.company.id,
      content,
      status: "draft",
      created_by: ctx.profile.id,
      ai_generated: true,
    });
    if (error) return { error: error.message };
    revalidatePath("/smm");
    return { success: true };
  }

  return { error: `Неизвестный тип действия: ${action.action_type}` };
}

export async function approveAgentAction(id: string): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { data: action, error: fetchError } = await supabase
    .from("agent_actions")
    .select("*")
    .eq("id", id)
    .eq("company_id", ctx.company.id)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchError || !action) return { error: "Действие не найдено" };

  const result = await executeAction(action as AgentAction);
  if (result.error) {
    await supabase
      .from("agent_actions")
      .update({ status: "failed", result: { error: result.error }, resolved_at: new Date().toISOString() })
      .eq("id", id);
    return result;
  }

  await supabase
    .from("agent_actions")
    .update({
      status: "executed",
      result: { ok: true },
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/chat");
  revalidatePath("/crm/tasks");
  return { success: true };
}

export async function rejectAgentAction(id: string): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("agent_actions")
    .update({
      status: "rejected",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("company_id", ctx.company.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  revalidatePath("/chat");
  return { success: true };
}
