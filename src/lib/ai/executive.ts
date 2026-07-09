import type { ExecutiveRole } from "@/lib/ai/roles";

export type { ExecutiveRole };

export type ExecutiveMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ExecutiveSnapshot = {
  companyName: string;
  businessTypeLabel: string;
  aiFocus: string;
  currency: string;
  month: string;
  revenue: number;
  expense: number;
  profit: number;
  clients: number;
  deals: number;
  openTasks: number;
  employees: number;
  transactionsThisMonth: number;
  topClients: Array<{ name: string; total_purchases: number; segment: string }>;
  underperformers: Array<{ name: string; position: string | null; efficiency: number }>;
  issues: string[];
};

const ROLE_PROMPTS: Record<ExecutiveRole, string> = {
  ceo: `Ты — AI CEO (генеральный директор) компании. Смотри на бизнес целиком: выручка, прибыль, команда, клиенты, проблемы.
Дай владельцу ясную картину и 1-3 конкретных приоритета. Говори как опытный руководитель: прямо, без воды.`,
  cfo: `Ты — AI CFO (финансовый директор) компании. Твоя зона: выручка, расходы, прибыль, динамика денег.
Указывай на риски (убыток, рост расходов) и предлагай конкретные финансовые действия.`,
  hr: `Ты — AI HR-директор компании. Твоя зона: сотрудники, их KPI, производительность, проблемные сотрудники.
Называй отстающих по имени (данные ниже), предлагай действия: разговор, план развития, перераспределение задач.`,
  cmo: `Ты — AI CMO (директор по маркетингу) компании. Твоя зона: клиенты, сделки, воронка, удержание.
Анализируй клиентскую базу и сделки, предлагай конкретные шаги для роста продаж.`,
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildSystemPrompt(role: ExecutiveRole, snapshot: ExecutiveSnapshot) {
  return `${ROLE_PROMPTS[role]}

Правила:
- Отвечай на русском, кратко и по делу.
- Используй ТОЛЬКО данные компании ниже. Не выдумывай цифры. Если данных нет — скажи честно.
- Тип бизнеса: ${snapshot.businessTypeLabel}. ${snapshot.aiFocus}

Данные компании «${snapshot.companyName}» за ${snapshot.month}:
${JSON.stringify(snapshot, null, 2)}`;
}

export function fallbackExecutiveReply(
  role: ExecutiveRole,
  question: string,
  snapshot: ExecutiveSnapshot,
): string {
  const money = (v: number) => formatMoney(v, snapshot.currency);
  const issues =
    snapshot.issues.length > 0
      ? `\n\nПроблемы: ${snapshot.issues.join("; ")}`
      : "";

  if (role === "cfo") {
    return `Финансы за ${snapshot.month}: выручка ${money(snapshot.revenue)}, расходы ${money(snapshot.expense)}, прибыль ${money(snapshot.profit)}. Операций: ${snapshot.transactionsThisMonth}.${issues}`;
  }

  if (role === "hr") {
    const laggards = snapshot.underperformers
      .map((e) => `${e.name} (${e.efficiency}% плана)`)
      .join(", ");
    return `Команда: ${snapshot.employees} сотрудников. ${
      laggards ? `Отстают по KPI: ${laggards}.` : "Отстающих по KPI в этом месяце нет."
    }${issues}`;
  }

  if (role === "cmo") {
    const top = snapshot.topClients
      .slice(0, 3)
      .map((c) => `${c.name} (${money(c.total_purchases)})`)
      .join(", ");
    return `Клиенты: ${snapshot.clients}, сделки: ${snapshot.deals}. Топ клиенты: ${top || "пока нет данных"}.${issues}`;
  }

  const q = question.toLowerCase();
  if (q.includes("прибыл") || q.includes("финанс") || q.includes("выручк")) {
    return `За ${snapshot.month}: выручка ${money(snapshot.revenue)}, расходы ${money(snapshot.expense)}, прибыль ${money(snapshot.profit)}.${issues}`;
  }

  return `Сводка по «${snapshot.companyName}» за ${snapshot.month}:
• Выручка ${money(snapshot.revenue)}, расходы ${money(snapshot.expense)}, прибыль ${money(snapshot.profit)}
• Клиенты: ${snapshot.clients}, сделки: ${snapshot.deals}, открытые задачи: ${snapshot.openTasks}
• Команда: ${snapshot.employees} сотрудников${issues}

Для полноценных ответов AI добавьте OPENAI_API_KEY в переменные окружения.`;
}

async function callOpenAi(
  system: string,
  messages: ExecutiveMessage[],
  maxTokens = 1024,
): Promise<string | null> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: maxTokens,
    messages: [
      { role: "system" as const, content: system },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? null;
}

async function callAnthropic(
  system: string,
  messages: ExecutiveMessage[],
  maxTokens = 1024,
): Promise<string | null> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text.trim() : null;
}

async function complete(
  system: string,
  messages: ExecutiveMessage[],
  maxTokens = 1024,
): Promise<string | null> {
  try {
    if (process.env.OPENAI_API_KEY) {
      return await callOpenAi(system, messages, maxTokens);
    }
    if (process.env.ANTHROPIC_API_KEY) {
      return await callAnthropic(system, messages, maxTokens);
    }
  } catch {
    return null;
  }
  return null;
}

export async function askExecutive(
  role: ExecutiveRole,
  messages: ExecutiveMessage[],
  snapshot: ExecutiveSnapshot,
): Promise<string> {
  const reply = await complete(buildSystemPrompt(role, snapshot), messages);
  if (reply) return reply;

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  return fallbackExecutiveReply(role, lastUser?.content ?? "", snapshot);
}

export function fallbackDailyReport(snapshot: ExecutiveSnapshot): string {
  const money = (v: number) => formatMoney(v, snapshot.currency);
  const laggards = snapshot.underperformers
    .map((e) => `${e.name} — ${e.efficiency}% плана`)
    .join("\n");

  return `Ежедневный отчёт AI CEO — «${snapshot.companyName}»

Финансы (${snapshot.month}):
• Выручка: ${money(snapshot.revenue)}
• Расходы: ${money(snapshot.expense)}
• Прибыль: ${money(snapshot.profit)}

Операции:
• Клиенты: ${snapshot.clients}, сделки: ${snapshot.deals}
• Открытые задачи: ${snapshot.openTasks}
• Сотрудники: ${snapshot.employees}

${snapshot.issues.length > 0 ? `Проблемы:\n${snapshot.issues.map((issue) => `• ${issue}`).join("\n")}` : "Критичных проблем не обнаружено."}
${laggards ? `\nОтстающие по KPI:\n${laggards}` : ""}

Для развёрнутого AI-отчёта добавьте OPENAI_API_KEY.`;
}

export async function generateDailyReportText(
  snapshot: ExecutiveSnapshot,
): Promise<string> {
  const system = `Ты — AI CEO компании. Составь короткий ежедневный отчёт для владельца бизнеса на русском.

Структура:
1. Финансы (выручка, расходы, прибыль за месяц)
2. Операции (клиенты, сделки, задачи, команда)
3. Проблемы и риски (если есть — конкретно)
4. Рекомендации на сегодня (1-3 пункта, конкретные действия)

Правила: используй только данные ниже, не выдумывай цифры, пиши кратко.
Тип бизнеса: ${snapshot.businessTypeLabel}. ${snapshot.aiFocus}

Данные за ${snapshot.month}:
${JSON.stringify(snapshot, null, 2)}`;

  const reply = await complete(
    system,
    [{ role: "user", content: "Сформируй ежедневный отчёт." }],
    1400,
  );

  return reply ?? fallbackDailyReport(snapshot);
}
