import type { ColumnConfig, FieldConfig, FilterConfig, Transaction } from "@/types/database";
import { formatDate, formatMoney } from "@/lib/crud/utils";
import { Badge } from "@/components/ui/badge";

export const bankAccountFields: FieldConfig[] = [
  { key: "name", label: "Название счёта", type: "text", required: true },
  { key: "currency", label: "Валюта", type: "text", required: true },
];

export const bankAccountColumns: ColumnConfig<{ id: string; name: string; currency: string; created_at: string }>[] = [
  { key: "name", label: "Счёт" },
  { key: "currency", label: "Валюта" },
  { key: "created_at", label: "Создан", render: (row) => formatDate(row.created_at) },
];

export const transactionFields: FieldConfig[] = [
  { key: "bank_account_id", label: "Счёт", type: "select" },
  { key: "category_id", label: "Категория", type: "select" },
  { key: "amount", label: "Сумма (+ доход, − расход)", type: "number", required: true },
  { key: "transaction_date", label: "Дата", type: "date", required: true },
  { key: "description", label: "Описание", type: "textarea", required: true },
];

export const transactionFilters: FilterConfig[] = [
  {
    key: "type",
    label: "Тип",
    options: [
      { value: "all", label: "Все" },
      { value: "income", label: "Доходы" },
      { value: "expense", label: "Расходы" },
    ],
  },
  {
    key: "categorized",
    label: "Категория",
    options: [
      { value: "all", label: "Все" },
      { value: "yes", label: "С категорией" },
      { value: "no", label: "Без категории" },
    ],
  },
];

export const transactionColumns: ColumnConfig<Transaction>[] = [
  {
    key: "transaction_date",
    label: "Дата",
    render: (row) => formatDate(row.transaction_date),
  },
  { key: "description", label: "Описание" },
  {
    key: "bank_account_id",
    label: "Счёт",
    render: (row) => row.bank_accounts?.name ?? "—",
  },
  {
    key: "category_id",
    label: "Категория",
    render: (row) =>
      row.transaction_categories?.name ? (
        <Badge variant="outline">{row.transaction_categories.name}</Badge>
      ) : (
        "—"
      ),
  },
  {
    key: "amount",
    label: "Сумма",
    render: (row) => (
      <span className={row.amount >= 0 ? "text-green-600" : "text-red-600"}>
        {formatMoney(row.amount, row.currency)}
      </span>
    ),
  },
  {
    key: "ai_categorized",
    label: "AI",
    render: (row) => (row.ai_categorized ? <Badge variant="secondary">Claude</Badge> : "—"),
  },
];
