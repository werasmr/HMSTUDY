import type { ColumnConfig, FieldConfig, FilterConfig, Product } from "@/types/database";
import { formatMoney } from "@/lib/crud/utils";
import { Badge } from "@/components/ui/badge";
import { GenerateDescriptionCell } from "@/components/products/generate-description-cell";

const TYPE_LABELS: Record<string, string> = {
  product: "Товар",
  service: "Услуга",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  archived: "Архив",
};

export const productFields: FieldConfig[] = [
  { key: "name", label: "Название", type: "text", required: true },
  {
    key: "type",
    label: "Тип",
    type: "select",
    required: true,
    options: [
      { value: "product", label: "Товар" },
      { value: "service", label: "Услуга" },
    ],
  },
  { key: "sku", label: "SKU", type: "text" },
  { key: "cost", label: "Себестоимость", type: "number" },
  { key: "price", label: "Цена", type: "number" },
  { key: "margin_percent", label: "Маржа, %", type: "number", hiddenInTable: true },
  { key: "description", label: "Описание", type: "textarea", hiddenInTable: true },
  {
    key: "status",
    label: "Статус",
    type: "select",
    required: true,
    options: [
      { value: "active", label: "Активен" },
      { value: "archived", label: "Архив" },
    ],
  },
];

export const productFilters: FilterConfig[] = [
  {
    key: "type",
    label: "Тип",
    options: [
      { value: "all", label: "Все" },
      { value: "product", label: "Товары" },
      { value: "service", label: "Услуги" },
    ],
  },
  {
    key: "status",
    label: "Статус",
    options: [
      { value: "all", label: "Все" },
      { value: "active", label: "Активные" },
      { value: "archived", label: "Архив" },
    ],
  },
];

export const productColumns: ColumnConfig<Product>[] = [
  { key: "name", label: "Название" },
  {
    key: "type",
    label: "Тип",
    render: (row) => <Badge variant="secondary">{TYPE_LABELS[row.type]}</Badge>,
  },
  { key: "sku", label: "SKU", render: (row) => row.sku ?? "—" },
  {
    key: "cost",
    label: "Себестоимость",
    render: (row) => formatMoney(row.cost),
  },
  {
    key: "price",
    label: "Цена",
    render: (row) => formatMoney(row.price),
  },
  {
    key: "status",
    label: "Статус",
    render: (row) => <Badge variant="outline">{STATUS_LABELS[row.status]}</Badge>,
  },
  {
    key: "ai",
    label: "Claude",
    render: (row) => (
      <GenerateDescriptionCell productId={row.id} hasDescription={Boolean(row.description)} />
    ),
  },
];
