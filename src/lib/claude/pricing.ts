import Anthropic from "@anthropic-ai/sdk";

type CompetitorPrice = {
  competitorName: string;
  price: number;
};

type PricingInput = {
  productName?: string | null;
  cost: number;
  marginPercent: number;
  calculatedPrice: number;
  currency: string;
  competitorPrices: CompetitorPrice[];
};

export type PricingRecommendation = {
  recommendedPrice: number;
  reasoning: string;
};

export async function recommendPriceWithClaude(
  input: PricingInput,
): Promise<PricingRecommendation | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 768,
    tools: [
      {
        name: "recommend_price",
        description: "Recommend optimal selling price for a product or service",
        input_schema: {
          type: "object",
          properties: {
            recommended_price: { type: "number" },
            reasoning: { type: "string" },
          },
          required: ["recommended_price", "reasoning"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "recommend_price" },
    messages: [
      {
        role: "user",
        content: `Recommend a selling price for a small business in Russia.

Product: ${input.productName ?? "Без названия"}
Cost: ${input.cost} ${input.currency}
Target margin: ${input.marginPercent}%
Calculated price (cost + margin): ${input.calculatedPrice} ${input.currency}

Competitor prices:
${input.competitorPrices.length > 0 ? JSON.stringify(input.competitorPrices, null, 2) : "No competitor data"}

Respond in Russian in the reasoning field. Consider cost floor, margin, and competitor positioning.`,
      },
    ],
  });

  const toolBlock = response.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") return null;

  const result = toolBlock.input as {
    recommended_price: number;
    reasoning: string;
  };

  return {
    recommendedPrice: Number(result.recommended_price.toFixed(2)),
    reasoning: result.reasoning,
  };
}

export function fallbackPriceRecommendation(input: PricingInput): PricingRecommendation {
  if (input.competitorPrices.length === 0) {
    return {
      recommendedPrice: input.calculatedPrice,
      reasoning: `Базовая цена по формуле: себестоимость + маржа ${input.marginPercent}%. Данных конкурентов нет.`,
    };
  }

  const avgCompetitor =
    input.competitorPrices.reduce((sum, item) => sum + item.price, 0) /
    input.competitorPrices.length;

  const recommended = Number(
    Math.max(input.calculatedPrice, avgCompetitor * 0.95).toFixed(2),
  );

  return {
    recommendedPrice: recommended,
    reasoning: `Средняя цена конкурентов: ${avgCompetitor.toFixed(0)} ${input.currency}. Рекомендация не ниже себестоимости с маржой.`,
  };
}