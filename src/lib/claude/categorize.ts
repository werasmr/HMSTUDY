import Anthropic from "@anthropic-ai/sdk";

type CategoryOption = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type TransactionInput = {
  id: string;
  description: string;
  amount: number;
};

export type CategorizationResult = {
  transactionId: string;
  categoryId: string;
  confidence: number;
};

export async function categorizeTransactionsWithClaude(
  transactions: TransactionInput[],
  categories: CategoryOption[],
): Promise<CategorizationResult[]> {
  if (!process.env.ANTHROPIC_API_KEY || transactions.length === 0) {
    return [];
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [
      {
        name: "assign_categories",
        description: "Assign a transaction category to each bank transaction",
        input_schema: {
          type: "object",
          properties: {
            assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  transaction_id: { type: "string" },
                  category_id: { type: "string" },
                  confidence: { type: "number" },
                },
                required: ["transaction_id", "category_id", "confidence"],
              },
            },
          },
          required: ["assignments"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "assign_categories" },
    messages: [
      {
        role: "user",
        content: `Categorize bank transactions for a small business in Russia.

Rules:
- Positive amount = income, negative amount = expense
- Pick category_id only from the provided list
- confidence between 0 and 1

Categories:
${JSON.stringify(categories, null, 2)}

Transactions:
${JSON.stringify(transactions, null, 2)}`,
      },
    ],
  });

  const toolBlock = response.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") return [];

  const input = toolBlock.input as {
    assignments?: Array<{
      transaction_id: string;
      category_id: string;
      confidence: number;
    }>;
  };

  const validCategoryIds = new Set(categories.map((category) => category.id));

  return (input.assignments ?? [])
    .filter((item) => validCategoryIds.has(item.category_id))
    .map((item) => ({
      transactionId: item.transaction_id,
      categoryId: item.category_id,
      confidence: Math.min(1, Math.max(0, item.confidence ?? 0.7)),
    }));
}

export function fallbackCategorize(
  transactions: TransactionInput[],
  categories: CategoryOption[],
) {
  const incomeFallback = categories.find((category) => category.type === "income");
  const expenseFallback = categories.find((category) => category.type === "expense");

  return transactions.flatMap((transaction) => {
    const category = transaction.amount >= 0 ? incomeFallback : expenseFallback;
    if (!category) return [];

    return [
      {
        transactionId: transaction.id,
        categoryId: category.id,
        confidence: 0.3,
      },
    ];
  });
}
