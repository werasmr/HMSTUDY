import type { ColumnConfig, Deal, FieldConfig, FilterConfig } from "@/types/database";
import { DEAL_STAGE_LABELS, formatDate, formatMoney } from "@/lib/crud/utils";
import { Badge } from "@/components/ui/badge";

export const dealFields: FieldConfig[] = [
  { key: "title", label: "Название", type: "text", required: true },
  {
    key: "client_id",
    label: "Клиент",
    type: "select",
    required: true,
  },
  {
    key: "stage",
    label: "Этап",
    type: "select",
    required: true,
    options: Object.entries(DEAL_STAGE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  { key: "amount", label: "Сумма", type: "number" },
  { key: "expected_close_date", label: "Дата закрытия", type: "date" },
  { key: "notes", label: "Заметки", type: "textarea", hiddenInTable: true },
];

export const dealFilters: FilterConfig[] = [
  {
    key: "stage",
    label: "Этап",
    options: [
      { value: "all", label: "Все" },
      ...Object.entries(DEAL_STAGE_LABELS).map(([value, label]) => ({ value, label })),
    ],
  },
];

export const dealColumns: ColumnConfig<Deal>[] = [
  { key: "title", label: "Сделка" },
  {
    key: "client_id",
    label: "Клиент",
    render: (row) => row.clients?.name ?? "—",
  },
  {
    key: "stage",
    label: "Этап",
    render: (row) => <Badge variant="secondary">{DEAL_STAGE_LABELS[row.stage]}</Badge>,
  },
  {
    key: "amount",
    label: "Сумма",
    render: (row) => formatMoney(row.amount, row.currency),
  },
  {
    key: "expected_close_date",
    label: "Закрытие",
    render: (row) => formatDate(row.expected_close_date),
  },
];
