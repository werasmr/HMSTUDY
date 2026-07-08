import type { Client, ColumnConfig, FieldConfig, FilterConfig } from "@/types/database";
import {
  CLIENT_SEGMENT_LABELS,
  CLIENT_STATUS_LABELS,
  formatDate,
  formatMoney,
} from "@/lib/crud/utils";
import { Badge } from "@/components/ui/badge";

export const clientFields: FieldConfig[] = [
  { key: "name", label: "Имя", type: "text", required: true },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Телефон", type: "text" },
  {
    key: "status",
    label: "Статус",
    type: "select",
    required: true,
    options: Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  { key: "source", label: "Источник", type: "text" },
  { key: "total_purchases", label: "Сумма покупок", type: "number" },
  { key: "notes", label: "Заметки", type: "textarea", hiddenInTable: true },
];

export const clientFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Статус",
    options: [
      { value: "all", label: "Все" },
      ...Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
    ],
  },
  {
    key: "segment",
    label: "Сегмент",
    options: [
      { value: "all", label: "Все" },
      ...Object.entries(CLIENT_SEGMENT_LABELS).map(([value, label]) => ({ value, label })),
    ],
  },
];

export const clientColumns: ColumnConfig<Client>[] = [
  { key: "name", label: "Имя" },
  { key: "email", label: "Email", render: (row) => row.email ?? "—" },
  { key: "phone", label: "Телефон", render: (row) => row.phone ?? "—" },
  {
    key: "status",
    label: "Статус",
    render: (row) => (
      <Badge variant="secondary">{CLIENT_STATUS_LABELS[row.status]}</Badge>
    ),
  },
  {
    key: "segment",
    label: "Сегмент",
    render: (row) => (
      <Badge variant="outline">{CLIENT_SEGMENT_LABELS[row.segment]}</Badge>
    ),
  },
  {
    key: "total_purchases",
    label: "Покупки",
    render: (row) => formatMoney(row.total_purchases),
  },
  {
    key: "created_at",
    label: "Создан",
    render: (row) => formatDate(row.created_at),
  },
];
