import { Suspense } from "react";
import {
  createInboxMessage,
  deleteInboxMessage,
  listChannelOptions,
  listClientOptionsForInbox,
  listInboxMessages,
  updateInboxMessage,
} from "@/app/actions/inbox";
import { EntityCrud } from "@/components/crud/entity-crud";
import {
  inboxMessageColumns,
  inboxMessageFields,
  inboxMessageFilters,
} from "@/lib/crud/configs/inbox";

type InboxPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

const INBOX_NAV = [
  { href: "/inbox", label: "Сообщения", isActive: true },
  { href: "/inbox/channels", label: "Каналы" },
];

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const filters = await searchParams;
  const [messages, channelOptions, clientOptions] = await Promise.all([
    listInboxMessages(filters),
    listChannelOptions(),
    listClientOptionsForInbox(),
  ]);

  return (
    <Suspense fallback={null}>
      <EntityCrud
        title="Инбокс"
        description="Входящие и исходящие сообщения. Telegram-бот — позже; сейчас ручное управление."
        rows={messages}
        fields={inboxMessageFields}
        filters={inboxMessageFilters}
        columns={inboxMessageColumns}
        moduleNav={INBOX_NAV}
        dynamicOptions={{
          channel_id: channelOptions,
          client_id: [{ value: "", label: "—" }, ...clientOptions],
        }}
        searchPlaceholder="Поиск по контакту или тексту..."
        createAction={createInboxMessage}
        updateAction={updateInboxMessage}
        deleteAction={deleteInboxMessage}
      />
    </Suspense>
  );
}
