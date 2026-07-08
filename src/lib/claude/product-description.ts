import Anthropic from "@anthropic-ai/sdk";

type ProductInput = {
  name: string;
  type: "product" | "service";
  price?: number | null;
  cost?: number | null;
  sku?: string | null;
};

export async function generateProductDescriptionWithClaude(
  product: ProductInput,
  companyName: string,
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Write a concise product description in Russian for a small business catalog.

Company: ${companyName}
Name: ${product.name}
Type: ${product.type === "service" ? "услуга" : "товар"}
SKU: ${product.sku ?? "—"}
Price: ${product.price ?? "—"}
Cost: ${product.cost ?? "—"}

Requirements:
- 2-4 sentences
- Professional, clear tone
- Highlight value for the customer
- No markdown, plain text only`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  return textBlock.text.trim();
}

export function fallbackProductDescription(product: ProductInput) {
  const kind = product.type === "service" ? "Услуга" : "Товар";
  const pricePart = product.price ? ` Цена: ${product.price} ₽.` : "";
  return `${kind} «${product.name}». Качественное предложение для клиентов.${pricePart}`;
}
