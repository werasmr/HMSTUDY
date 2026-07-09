export type ExecutiveRole = "ceo" | "cfo" | "hr" | "cmo";

export const EXECUTIVE_ROLES: Array<{
  key: ExecutiveRole;
  label: string;
  title: string;
  description: string;
}> = [
  {
    key: "ceo",
    label: "CEO",
    title: "AI CEO",
    description: "Стратегия, приоритеты, общая картина бизнеса",
  },
  {
    key: "cfo",
    label: "CFO",
    title: "AI CFO",
    description: "Финансы: выручка, расходы, прибыль, денежный поток",
  },
  {
    key: "hr",
    label: "HR",
    title: "AI HR-директор",
    description: "Команда: сотрудники, KPI, производительность",
  },
  {
    key: "cmo",
    label: "CMO",
    title: "AI CMO",
    description: "Маркетинг: клиенты, лиды, сделки, продажи",
  },
];
