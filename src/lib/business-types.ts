export type BusinessTypeKey =
  | "restaurant"
  | "dental_clinic"
  | "beauty_salon"
  | "agency"
  | "ecommerce"
  | "real_estate"
  | "other";

export type BusinessTypePreset = {
  key: BusinessTypeKey;
  label: string;
  /** KPI, за которыми AI следит в первую очередь */
  kpis: Array<{ key: string; label: string }>;
  /** Подсказка для AI: на что смотреть при анализе этой ниши */
  aiFocus: string;
};

export const BUSINESS_TYPES: BusinessTypePreset[] = [
  {
    key: "restaurant",
    label: "Ресторан / кафе",
    kpis: [
      { key: "avg_check", label: "Средний чек" },
      { key: "bookings", label: "Бронирования" },
      { key: "table_occupancy", label: "Загрузка столов, %" },
    ],
    aiFocus:
      "Следи за средним чеком, количеством бронирований и загрузкой столов. Падение загрузки в будни — повод для акций.",
  },
  {
    key: "dental_clinic",
    label: "Стоматология",
    kpis: [
      { key: "appointments", label: "Записи" },
      { key: "repeat_visits", label: "Повторные визиты" },
      { key: "doctor_utilization", label: "Загрузка врачей, %" },
    ],
    aiFocus:
      "Следи за записями, долей повторных визитов и загрузкой врачей. Низкая доля повторных визитов — проблема удержания пациентов.",
  },
  {
    key: "beauty_salon",
    label: "Салон красоты",
    kpis: [
      { key: "appointments", label: "Записи" },
      { key: "repeat_clients", label: "Повторные клиенты" },
      { key: "master_utilization", label: "Загрузка мастеров, %" },
    ],
    aiFocus:
      "Следи за записями, возвратом клиентов и загрузкой мастеров. Простой мастеров — прямые потери выручки.",
  },
  {
    key: "agency",
    label: "Агентство",
    kpis: [
      { key: "leads", label: "Лиды" },
      { key: "deals", label: "Сделки" },
      { key: "staff_utilization", label: "Утилизация сотрудников, %" },
    ],
    aiFocus:
      "Следи за лидами, конверсией в сделки и утилизацией сотрудников. Утилизация ниже 70% — команда недозагружена.",
  },
  {
    key: "ecommerce",
    label: "E-commerce",
    kpis: [
      { key: "orders", label: "Заказы" },
      { key: "avg_order", label: "Средний чек" },
      { key: "conversion", label: "Конверсия, %" },
    ],
    aiFocus:
      "Следи за заказами, средним чеком и конверсией. Падение конверсии при стабильном трафике — проблема сайта или цен.",
  },
  {
    key: "real_estate",
    label: "Недвижимость",
    kpis: [
      { key: "leads", label: "Лиды" },
      { key: "showings", label: "Показы" },
      { key: "closed_deals", label: "Закрытые сделки" },
    ],
    aiFocus:
      "Следи за лидами, показами и закрытыми сделками. Много показов без сделок — проблема в объектах или переговорах.",
  },
  {
    key: "other",
    label: "Другое",
    kpis: [
      { key: "revenue", label: "Выручка" },
      { key: "clients", label: "Клиенты" },
      { key: "deals", label: "Сделки" },
    ],
    aiFocus: "Следи за выручкой, прибылью, клиентской базой и выполнением KPI сотрудниками.",
  },
];

export function getBusinessType(key: string | null | undefined): BusinessTypePreset {
  return BUSINESS_TYPES.find((type) => type.key === key) ?? BUSINESS_TYPES[BUSINESS_TYPES.length - 1];
}

export const BUSINESS_TYPE_OPTIONS = BUSINESS_TYPES.map((type) => ({
  value: type.key,
  label: type.label,
}));
