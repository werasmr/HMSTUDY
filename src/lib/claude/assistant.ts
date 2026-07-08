export type BusinessSnapshot = {
  companyName: string;
  currency: string;
  month: string;
  clients: number;
  deals: number;
  openTasks: number;
  products: number;
  employees: number;
  transactionsThisMonth: number;
  income: number;
  expense: number;
  balance: number;
  topClients: Array<{ name: string; total_purchases: number; segment: string }>;
};

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function fallbackAssistantReply(
  question: string,
  snapshot: BusinessSnapshot,
): string {
  const q = question.toLowerCase();

  if (q.includes("прибыл") || q.includes("баланс") || q.includes("финанс")) {
    return `За ${snapshot.month}: баланс ${formatMoney(snapshot.balance, snapshot.currency)}, доходы ${formatMoney(snapshot.income, snapshot.currency)}, расходы ${formatMoney(snapshot.expense, snapshot.currency)}. Операций в месяце: ${snapshot.transactionsThisMonth}.`;
  }

  if (q.includes("клиент")) {
    const top = snapshot.topClients
      .slice(0, 3)
      .map((c) => `${c.name} (${formatMoney(c.total_purchases, snapshot.currency)})`)
      .join(", ");
    return `В базе ${snapshot.clients} клиентов и ${snapshot.deals} сделок. Топ клиенты: ${top || "пока нет данных"}.`;
  }

  if (q.includes("задач")) {
    return `Открытых задач: ${snapshot.openTasks}. Активных сделок: ${snapshot.deals}.`;
  }

  if (q.includes("продукт") || q.includes("каталог")) {
    return `В каталоге ${snapshot.products} позиций. Команда: ${snapshot.employees} сотрудников.`;
  }

  return `Краткая сводка по ${snapshot.companyName} (${snapshot.month}):
• Клиенты: ${snapshot.clients}, сделки: ${snapshot.deals}, открытые задачи: ${snapshot.openTasks}
• Финансы: баланс ${formatMoney(snapshot.balance, snapshot.currency)}, доходы ${formatMoney(snapshot.income, snapshot.currency)}, расходы ${formatMoney(snapshot.expense, snapshot.currency)}
• Продукты: ${snapshot.products}, сотрудники: ${snapshot.employees}

Задайте вопрос про финансы, клиентов, задачи или каталог. Для полноценного AI добавьте ANTHROPIC_API_KEY в переменные окружения.`;
}

export async function askAssistantWithClaude(
  messages: AssistantMessage[],
  snapshot: BusinessSnapshot,
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return fallbackAssistantReply(lastUser?.content ?? "", snapshot);
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const system = `Ты AI-ассистент Proto для малого бизнеса в России. Отвечай кратко, по делу, на русском.
Используй только данные компании ниже. Если данных нет — честно скажи.
Не выдумывай цифры.

Снимок компании (${snapshot.month}):
${JSON.stringify(snapshot, null, 2)}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (textBlock && textBlock.type === "text") {
    return textBlock.text.trim();
  }

  return fallbackAssistantReply(messages.at(-1)?.content ?? "", snapshot);
}
