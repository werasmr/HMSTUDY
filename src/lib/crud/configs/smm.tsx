import type { ColumnConfig, FieldConfig, SocialAccount, SocialPost } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/crud/utils";

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  disabled: "Отключён",
  error: "Ошибка",
};

export const socialAccountFields: FieldConfig[] = [
  { key: "name", label: "Название", type: "text", required: true },
  {
    key: "platform",
    label: "Платформа",
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

export const socialAccountColumns: ColumnConfig<SocialAccount>[] = [
  { key: "name", label: "Аккаунт" },
  { key: "platform", label: "Платформа" },
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

export const POST_STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  scheduled: "Запланирован",
  published: "Опубликован",
  failed: "Ошибка",
};

export const socialPostFields: FieldConfig[] = [
  { key: "social_account_id", label: "Аккаунт", type: "select" },
  { key: "content", label: "Текст поста", type: "textarea", required: true },
  { key: "scheduled_at", label: "Запланировать на", type: "date" },
  {
    key: "status",
    label: "Статус",
    type: "select",
    required: true,
    options: Object.entries(POST_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  },
];

export const socialPostColumns: ColumnConfig<SocialPost>[] = [
  {
    key: "content",
    label: "Текст",
    render: (row) => (
      <span className="line-clamp-2 max-w-xs">{row.content}</span>
    ),
  },
  {
    key: "social_accounts",
    label: "Аккаунт",
    render: (row) => row.social_accounts?.name ?? "—",
  },
  {
    key: "status",
    label: "Статус",
    render: (row) => (
      <Badge variant="outline">{POST_STATUS_LABELS[row.status]}</Badge>
    ),
  },
  {
    key: "scheduled_at",
    label: "План",
    render: (row) => (row.scheduled_at ? formatDate(row.scheduled_at) : "—"),
  },
];

export const socialPostFilters = [
  {
    key: "status",
    label: "Статус",
    options: [
      { value: "all", label: "Все" },
      ...Object.entries(POST_STATUS_LABELS).map(([value, label]) => ({ value, label })),
    ],
  },
];
