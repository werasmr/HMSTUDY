import {
  createConversation,
  getConversationMessages,
  listConversations,
} from "@/app/actions/chat";
import { listPendingAgentActions } from "@/app/actions/agent-actions";
import { ActionQueue } from "@/components/assistant/action-queue";
import { ChatPanel } from "@/components/assistant/chat-panel";
import { PageHeader } from "@/components/layout/page-header";

type ChatPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;
  let conversationId = params.c ?? null;

  const conversations = await listConversations();
  const pendingActions = await listPendingAgentActions();

  if (!conversationId && conversations.length > 0) {
    conversationId = conversations[0].id;
  }

  if (!conversationId) {
    const created = await createConversation();
    conversationId = created?.id ?? null;
  }

  const messages = conversationId
    ? await getConversationMessages(conversationId)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI CEO"
        description="Ваш AI-руководитель: переключайтесь между ролями CEO, CFO, HR и CMO — ответы строятся на данных вашей компании."
      />

      <ActionQueue actions={pendingActions} />

      <ChatPanel
        conversations={conversations}
        initialConversationId={conversationId}
        initialMessages={messages}
      />
    </div>
  );
}
