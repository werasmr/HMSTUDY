import type { Channel, ColumnConfig, FieldConfig } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/crud/utils";

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  disabled: "Отключён",
  error: "Ошибка",
};

export const channelFields: FieldConfig[] = [
  { key: "name", label: "Название", type: "text", required: true },
  {
    key: "type",
    label: "Тип",
    type: "select",
    required: true,
    options: [{ value: "telegram", label: "Telegram" }],
  },
  {
    key: "status",
    label: "Статус",
    type: "select",
    required: true,
    options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
  },
];

export const channelColumns: ColumnConfig<Channel>[] = [
  { key: "name", label: "Канал" },
  { key: "type", label: "Тип" },
  {
    key: "status",
    label: "Статус",
    render: (row) => <Badge variant="secondary">{STATUS_LABELS[row.status]}</Badge>,
  },
  {
    key: "created_at",
    label: "Создан",
    render: (row) => formatDate(row.created_at),
  },
];

export const MESSAGE_STATUS_LABELS: Record<string, string> = {
  new: "Новое",
  draft_ready: "Черновик AI",
  approved: "Одобрено",
  sent: "Отправлено",
  archived: "Архив",
};

export const inboxMessageFields: FieldConfig[] = [
  { key: "channel_id", label: "Канал", type: "select", required: true },
  { key: "client_id", label: "Клиент", type: "select" },
  {
    key: "direction",
    label: "Направление",
    type: "select",
    required: true,
    options: [
      { value: "inbound", label: "Входящее" },
      { value: "outbound", label: "Исходящее" },
    ],
  },
  { key: "from_contact", label: "От кого", type: "text", required: true },
  { key: "subject", label: "Тема", type: "text" },
  { key: "body", label: "Текст", type: "textarea", required: true },
  {
    key: "status",
    label: "Статус",
    type: "select",
    required: true,
    options: Object.entries(MESSAGE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  },
];

export const inboxMessageColumns: ColumnConfig<import("@/types/database").InboxMessage>[] = [
  {
    key: "from_contact",
    label: "Контакт",
  },
  {
    key: "channels",
    label: "Канал",
    render: (row) => row.channels?.name ?? "—",
  },
  {
    key: "direction",
    label: "Тип",
    render: (row) => (row.direction === "inbound" ? "Входящее" : "Исходящее"),
  },
  {
    key: "status",
    label: "Статус",
    render: (row) => (
      <Badge variant="outline">{MESSAGE_STATUS_LABELS[row.status]}</Badge>
    ),
  },
  {
    key: "received_at",
    label: "Дата",
    render: (row) => formatDate(row.received_at),
  },
];

export const inboxMessageFilters = [
  {
    key: "status",
    label: "Статус",
    options: [
      { value: "all", label: "Все" },
      ...Object.entries(MESSAGE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
    ],
  },
];
