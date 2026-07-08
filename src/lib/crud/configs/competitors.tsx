import type { ColumnConfig, Competitor, CompetitorItem, FieldConfig } from "@/types/database";
import { formatDate, formatMoney } from "@/lib/crud/utils";

export const competitorFields: FieldConfig[] = [
  { key: "name", label: "Название", type: "text", required: true },
  { key: "website", label: "Сайт", type: "text" },
  { key: "notes", label: "Заметки", type: "textarea", hiddenInTable: true },
];

export const competitorColumns: ColumnConfig<Competitor>[] = [
  { key: "name", label: "Конкурент" },
  { key: "website", label: "Сайт", render: (row) => row.website ?? "—" },
  {
    key: "created_at",
    label: "Добавлен",
    render: (row) => formatDate(row.created_at),
  },
];

export const competitorItemFields: FieldConfig[] = [
  { key: "product_name", label: "Товар/услуга", type: "text", required: true },
  { key: "price", label: "Цена", type: "number", required: true },
  { key: "currency", label: "Валюта", type: "text" },
  { key: "recorded_at", label: "Дата фиксации", type: "date" },
  { key: "notes", label: "Заметки", type: "textarea", hiddenInTable: true },
];

export const competitorItemColumns: ColumnConfig<CompetitorItem>[] = [
  { key: "product_name", label: "Товар/услуга" },
  {
    key: "price",
    label: "Цена",
    render: (row) => formatMoney(row.price, row.currency),
  },
  {
    key: "recorded_at",
    label: "Дата",
    render: (row) => formatDate(row.recorded_at),
  },
  { key: "notes", label: "Заметки", render: (row) => row.notes ?? "—" },
];
