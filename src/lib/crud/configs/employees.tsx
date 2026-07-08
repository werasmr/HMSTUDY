import type { ColumnConfig, Employee, FieldConfig, FilterConfig } from "@/types/database";
import { formatDate } from "@/lib/crud/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  inactive: "Неактивен",
};

export const employeeFields: FieldConfig[] = [
  { key: "full_name", label: "ФИО", type: "text", required: true },
  { key: "position", label: "Должность", type: "text" },
  { key: "department", label: "Отдел", type: "text" },
  { key: "hire_date", label: "Дата найма", type: "date" },
  {
    key: "status",
    label: "Статус",
    type: "select",
    required: true,
    options: [
      { value: "active", label: "Активен" },
      { value: "inactive", label: "Неактивен" },
    ],
  },
];

export const employeeFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Статус",
    options: [
      { value: "all", label: "Все" },
      { value: "active", label: "Активные" },
      { value: "inactive", label: "Неактивные" },
    ],
  },
];

export const employeeColumns: ColumnConfig<Employee>[] = [
  { key: "full_name", label: "Сотрудник" },
  { key: "position", label: "Должность", render: (row) => row.position ?? "—" },
  { key: "department", label: "Отдел", render: (row) => row.department ?? "—" },
  {
    key: "status",
    label: "Статус",
    render: (row) => <Badge variant="secondary">{STATUS_LABELS[row.status]}</Badge>,
  },
  {
    key: "hire_date",
    label: "Найм",
    render: (row) => formatDate(row.hire_date),
  },
];

export const KPI_PRESETS = [
  { key: "sales", label: "Продажи, ₽" },
  { key: "calls", label: "Звонки" },
  { key: "tasks_done", label: "Задачи выполнено" },
  { key: "deals_won", label: "Сделки выиграны" },
];
