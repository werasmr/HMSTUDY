import { Suspense } from "react";
import {
  createChannel,
  deleteChannel,
  listChannels,
  updateChannel,
} from "@/app/actions/inbox";
import { EntityCrud } from "@/components/crud/entity-crud";
import { channelColumns, channelFields } from "@/lib/crud/configs/inbox";

const INBOX_NAV = [
  { href: "/inbox", label: "Сообщения" },
  { href: "/inbox/channels", label: "Каналы", isActive: true },
];

export default async function InboxChannelsPage() {
  const channels = await listChannels();

  return (
    <Suspense fallback={null}>
      <EntityCrud
        title="Каналы инбокса"
        description="Telegram и другие каналы. Подключение бота — в следующих версиях; пока ручной ввод сообщений."
        rows={channels}
        fields={channelFields}
        columns={channelColumns}
        moduleNav={INBOX_NAV}
        createAction={createChannel}
        updateAction={updateChannel}
        deleteAction={deleteChannel}
      />
    </Suspense>
  );
}
