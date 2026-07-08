import type { ColumnConfig, FieldConfig, FilterConfig, Task } from "@/types/database";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  formatDate,
} from "@/lib/crud/utils";
import { Badge } from "@/components/ui/badge";

export const taskFields: FieldConfig[] = [
  { key: "title", label: "Задача", type: "text", required: true },
  { key: "description", label: "Описание", type: "textarea", hiddenInTable: true },
  {
    key: "status",
    label: "Статус",
    type: "select",
    required: true,
    options: Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    key: "priority",
    label: "Приоритет",
    type: "select",
    required: true,
    options: Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  { key: "due_date", label: "Срок", type: "date" },
  {
    key: "entity_type",
    label: "Связь",
    type: "select",
    options: [
      { value: "none", label: "Нет" },
      { value: "client", label: "Клиент" },
      { value: "deal", label: "Сделка" },
    ],
  },
  { key: "entity_id", label: "Объект", type: "select" },
];

export const taskFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Статус",
    options: [
      { value: "all", label: "Все" },
      ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label })),
    ],
  },
  {
    key: "priority",
    label: "Приоритет",
    options: [
      { value: "all", label: "Все" },
      ...Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
    ],
  },
];

export const taskColumns: ColumnConfig<Task>[] = [
  { key: "title", label: "Задача" },
  {
    key: "status",
    label: "Статус",
    render: (row) => <Badge variant="secondary">{TASK_STATUS_LABELS[row.status]}</Badge>,
  },
  {
    key: "priority",
    label: "Приоритет",
    render: (row) => <Badge variant="outline">{TASK_PRIORITY_LABELS[row.priority]}</Badge>,
  },
  {
    key: "due_date",
    label: "Срок",
    render: (row) => formatDate(row.due_date),
  },
];
