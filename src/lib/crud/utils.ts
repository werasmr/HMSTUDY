import type { ClientSegment, CompanySettings } from "@/types/database";

export function computeSegment(
  totalPurchases: number,
  settings: CompanySettings,
): ClientSegment {
  const { vip, regular } = settings.segment_thresholds;

  if (totalPurchases >= vip) return "vip";
  if (totalPurchases >= regular) return "regular";
  if (totalPurchases > 0) return "low_value";
  return "unsegmented";
}

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  lead: "Лид",
  active: "Активный",
  inactive: "Неактивный",
  churned: "Ушёл",
};

export const CLIENT_SEGMENT_LABELS: Record<string, string> = {
  vip: "VIP",
  regular: "Regular",
  low_value: "Low value",
  unsegmented: "Без сегмента",
};

export const DEAL_STAGE_LABELS: Record<string, string> = {
  lead: "Лид",
  qualified: "Квалификация",
  proposal: "Предложение",
  negotiation: "Переговоры",
  won: "Выиграна",
  lost: "Проиграна",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "К выполнению",
  in_progress: "В работе",
  done: "Готово",
  canceled: "Отменена",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ru-RU");
}

export function formatMoney(value: number | null, currency = "RUB") {
  if (value == null) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export function pickFormData(formData: FormData, keys: string[]) {
  return Object.fromEntries(
    keys.map((key) => [key, String(formData.get(key) ?? "").trim()]),
  ) as Record<string, string>;
}

export function calculatePrice(cost: number, marginPercent: number) {
  return Number((cost * (1 + marginPercent / 100)).toFixed(2));
}
