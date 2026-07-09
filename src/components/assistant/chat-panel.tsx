"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createConversation,
  deleteConversation,
  sendChatMessage,
  setConversationRole,
} from "@/app/actions/chat";
import { EXECUTIVE_ROLES, type ExecutiveRole } from "@/lib/ai/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatConversation, ChatMessage } from "@/types/database";

const SUGGESTIONS: Record<ExecutiveRole, string[]> = {
  ceo: [
    "Как дела у бизнеса?",
    "Какие главные проблемы сейчас?",
    "Что сделать в первую очередь?",
  ],
  cfo: [
    "Какая прибыль за этот месяц?",
    "Куда уходят деньги?",
    "Есть ли финансовые риски?",
  ],
  hr: [
    "Кто из сотрудников отстаёт по KPI?",
    "Как работает команда?",
    "Кого стоит похвалить?",
  ],
  cmo: [
    "Сколько клиентов в базе?",
    "Какие сделки в работе?",
    "Как увеличить продажи?",
  ],
};

type ChatPanelProps = {
  conversations: ChatConversation[];
  initialConversationId: string | null;
  initialMessages: ChatMessage[];
};

export function ChatPanel({
  conversations,
  initialConversationId,
  initialMessages,
}: ChatPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeId = initialConversationId;
  const messages = initialMessages;
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const activeRole = (activeConversation?.ai_role ?? "ceo") as ExecutiveRole;
  const roleInfo =
    EXECUTIVE_ROLES.find((role) => role.key === activeRole) ?? EXECUTIVE_ROLES[0];

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleNewChat() {
    const conversation = await createConversation(undefined, activeRole);
    if (!conversation) {
      toast.error("Не удалось создать диалог");
      return;
    }
    router.push(`/chat?c=${conversation.id}`);
    router.refresh();
  }

  async function handleRoleChange(role: ExecutiveRole) {
    if (!activeId || role === activeRole) return;
    const result = await setConversationRole(activeId, role);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    refresh();
  }

  async function handleSend() {
    if (!activeId || !message.trim() || pending) return;

    const text = message.trim();
    setMessage("");

    const result = await sendChatMessage(activeId, text);
    if (result.error) {
      toast.error(result.error);
      setMessage(text);
      return;
    }

    refresh();
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Удалить диалог?")) return;
    const result = await deleteConversation(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.push("/chat");
    refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Диалоги</CardTitle>
          <Button size="icon-sm" onClick={handleNewChat} aria-label="Новый диалог">
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {conversations.length === 0 && (
            <p className="text-sm text-muted-foreground">Пока нет диалогов</p>
          )}
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2 py-1.5",
                activeId === conversation.id
                  ? "border-primary/30 bg-primary/5"
                  : "border-transparent hover:bg-muted/50",
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left text-sm"
                onClick={() => router.push(`/chat?c=${conversation.id}`)}
              >
                <span className="mr-1.5 text-xs font-semibold uppercase text-primary/70">
                  {conversation.ai_role || "ceo"}
                </span>
                {conversation.title ?? "Диалог"}
              </button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleDelete(conversation.id)}
                aria-label="Удалить"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="flex min-h-[560px] flex-col">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{roleInfo.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
              </div>
            </div>
            {activeId && (
              <div className="flex flex-wrap gap-1.5">
                {EXECUTIVE_ROLES.map((role) => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => void handleRoleChange(role.key)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      role.key === activeRole
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:border-primary/30 hover:bg-primary/5",
                    )}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 pt-4">
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <p className="text-muted-foreground">Создайте диалог, чтобы начать</p>
              <Button onClick={handleNewChat}>
                <Plus className="mr-2 h-4 w-4" />
                Новый диалог
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
                {messages.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Примеры вопросов:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS[activeRole].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="rounded-full border bg-background px-3 py-1.5 text-xs hover:border-primary/30 hover:bg-primary/5"
                          onClick={() => setMessage(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      item.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {item.content}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="flex gap-2 border-t pt-4">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={`Спросите ${roleInfo.title} о вашем бизнесе...`}
                  rows={2}
                  className="min-h-[72px] resize-none"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <Button
                  className="h-auto shrink-0 px-4"
                  onClick={() => void handleSend()}
                  disabled={pending || !message.trim()}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
