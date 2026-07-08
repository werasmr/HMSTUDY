"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createConversation,
  deleteConversation,
  sendChatMessage,
} from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatConversation, ChatMessage } from "@/types/database";

const SUGGESTIONS = [
  "Какая прибыль за этот месяц?",
  "Сколько клиентов в базе?",
  "Какие задачи открыты?",
  "Краткая сводка по бизнесу",
];

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

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleNewChat() {
    const conversation = await createConversation();
    if (!conversation) {
      toast.error("Не удалось создать диалог");
      return;
    }
    router.push(`/assistant?c=${conversation.id}`);
    router.refresh();
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
    router.push("/assistant");
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
                onClick={() => router.push(`/assistant?c=${conversation.id}`)}
              >
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
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Proto AI</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ответы на основе данных вашей компании
              </p>
            </div>
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
                      {SUGGESTIONS.map((suggestion) => (
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
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
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
                  placeholder="Спросите про финансы, клиентов или задачи..."
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
