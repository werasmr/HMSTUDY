"use server";

import { revalidatePath } from "next/cache";
import { proposeAgentAction } from "@/app/actions/agent-actions";
import { getDashboardOverview } from "@/app/actions/dashboard";
import { getUserContext } from "@/lib/auth";
import {
  askAssistantWithClaude,
  type BusinessSnapshot,
} from "@/lib/claude/assistant";
import { createClient } from "@/lib/supabase/server";
import type { ChatConversation, ChatMessage, CrudActionResult } from "@/types/database";

async function requireContext() {
  const ctx = await getUserContext();
  if (!ctx) throw new Error("Компания не найдена");
  return ctx;
}

async function buildSnapshot(): Promise<BusinessSnapshot> {
  const ctx = await requireContext();
  const overview = await getDashboardOverview();
  const supabase = await createClient();
  const month = new Date().toISOString().slice(0, 7);

  const { data: topClients } = await supabase
    .from("clients")
    .select("name, total_purchases, segment")
    .eq("company_id", ctx.company.id)
    .is("duplicate_of", null)
    .order("total_purchases", { ascending: false })
    .limit(5);

  return {
    companyName: ctx.company.name,
    currency: overview.finance.currency,
    month,
    clients: overview.counts.clients,
    deals: overview.counts.deals,
    openTasks: overview.counts.openTasks,
    products: overview.counts.products,
    employees: overview.counts.employees,
    transactionsThisMonth: overview.counts.transactionsThisMonth,
    income: overview.finance.income,
    expense: overview.finance.expense,
    balance: overview.finance.balance,
    topClients: (topClients ?? []).map((client) => ({
      name: client.name,
      total_purchases: Number(client.total_purchases ?? 0),
      segment: client.segment,
    })),
  };
}

export async function listConversations(): Promise<ChatConversation[]> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("company_id", ctx.company.id)
    .eq("user_id", ctx.profile.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return (data ?? []) as ChatConversation[];
}

export async function getConversationMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("company_id", ctx.company.id)
    .eq("user_id", ctx.profile.id)
    .maybeSingle();

  if (!conversation) return [];

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as ChatMessage[];
}

export async function createConversation(title?: string): Promise<ChatConversation | null> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      company_id: ctx.company.id,
      user_id: ctx.profile.id,
      title: title ?? "Новый диалог",
    })
    .select("*")
    .single();

  if (error) return null;
  revalidatePath("/assistant");
  return data as ChatConversation;
}

export async function sendChatMessage(
  conversationId: string,
  content: string,
): Promise<CrudActionResult & { reply?: string }> {
  const trimmed = content.trim();
  if (!trimmed) return { error: "Введите сообщение" };

  const ctx = await requireContext();
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("id, title")
    .eq("id", conversationId)
    .eq("company_id", ctx.company.id)
    .eq("user_id", ctx.profile.id)
    .maybeSingle();

  if (!conversation) return { error: "Диалог не найден" };

  const { error: userError } = await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: trimmed,
  });

  if (userError) return { error: userError.message };

  const history = await getConversationMessages(conversationId);
  const snapshot = await buildSnapshot();

  const reply = await askAssistantWithClaude(
    history
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content ?? "",
      })),
    snapshot,
  );

  const { error: assistantError } = await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: reply,
  });

  if (assistantError) return { error: assistantError.message };

  const lower = trimmed.toLowerCase();
  if (lower.includes("создай задач") || lower.includes("создать задач")) {
    const titleMatch = trimmed.match(/[«"'](.+?)[»"']|задач[уеи]?\s+(.+)/i);
    const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? "Задача из AI-чата").slice(0, 120);
    await proposeAgentAction({
      actionType: "create_task",
      preview: `Создать задачу: ${title}`,
      payload: { title, description: `Создано из чата: ${trimmed}` },
      conversationId,
    });
  }

  if (lower.includes("создай пост") || lower.includes("напиши пост")) {
    await proposeAgentAction({
      actionType: "create_social_post",
      preview: `Создать SMM-пост: ${trimmed.slice(0, 80)}`,
      payload: { content: trimmed },
      conversationId,
    });
  }

  const title =
    conversation.title === "Новый диалог"
      ? trimmed.slice(0, 60)
      : conversation.title;

  await supabase
    .from("chat_conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/assistant");
  return { success: true, reply };
}

export async function deleteConversation(conversationId: string): Promise<CrudActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("company_id", ctx.company.id)
    .eq("user_id", ctx.profile.id);

  if (error) return { error: error.message };
  revalidatePath("/assistant");
  return { success: true };
}
