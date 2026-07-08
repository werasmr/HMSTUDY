"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  deletePricingScenario,
  recommendPrice,
  savePricingScenario,
} from "@/app/actions/pricing";
import { calculatePrice } from "@/lib/crud/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/crud/utils";
import type { PricingScenario } from "@/types/database";

type ProductOption = {
  id: string;
  name: string;
  cost: number | null;
  price: number | null;
  margin_percent: number | null;
};

type PricingCalculatorProps = {
  products: ProductOption[];
  scenarios: PricingScenario[];
  currency: string;
};

export function PricingCalculator({ products, scenarios, currency }: PricingCalculatorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [productId, setProductId] = useState("");
  const [cost, setCost] = useState("");
  const [marginPercent, setMarginPercent] = useState("30");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  const livePrice = useMemo(() => {
    const costValue = Number(cost);
    const marginValue = Number(marginPercent);
    if (!costValue || costValue <= 0) return null;
    return calculatePrice(costValue, marginValue || 0);
  }, [cost, marginPercent]);

  function applyProduct(productIdValue: string) {
    setProductId(productIdValue);
    const product = products.find((item) => item.id === productIdValue);
    if (!product) return;
    if (product.cost != null) setCost(String(product.cost));
    if (product.margin_percent != null) setMarginPercent(String(product.margin_percent));
  }

  async function handleRecommend() {
    const formData = new FormData();
    formData.set("product_id", productId);
    formData.set("cost", cost);
    formData.set("margin_percent", marginPercent);

    const result = await recommendPrice(formData);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    setCalculatedPrice(result.calculatedPrice ?? null);
    setAiPrice(result.aiRecommendedPrice ?? null);
    setAiReasoning(result.aiReasoning ?? null);
    toast.success("Рекомендация получена");
  }

  async function handleSave() {
    const formData = new FormData();
    formData.set("product_id", productId);
    formData.set("cost", cost);
    formData.set("margin_percent", marginPercent);
    formData.set("calculated_price", String(calculatedPrice ?? livePrice ?? ""));
    if (aiPrice != null) formData.set("ai_recommended_price", String(aiPrice));
    if (aiReasoning) formData.set("ai_reasoning", aiReasoning);

    const result = await savePricingScenario(formData);
    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Сценарий сохранён");
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Удалить сценарий?")) return;
    const result = await deletePricingScenario(id);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Удалено");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ценообразование</h1>
        <p className="text-muted-foreground">
          Калькулятор: себестоимость + маржа → цена. Рекомендация Claude с учётом конкурентов.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Калькулятор</CardTitle>
          <CardDescription>Формула: цена = себестоимость × (1 + маржа / 100)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="product_id">Продукт (опционально)</Label>
            <select
              id="product_id"
              value={productId}
              onChange={(event) => applyProduct(event.target.value)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">Без привязки</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Себестоимость</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="margin_percent">Маржа, %</Label>
            <Input
              id="margin_percent"
              type="number"
              step="0.1"
              value={marginPercent}
              onChange={(event) => setMarginPercent(event.target.value)}
            />
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 md:col-span-2">
            <p className="text-sm text-muted-foreground">Расчётная цена</p>
            <p className="text-2xl font-semibold">
              {livePrice != null ? formatMoney(livePrice, currency) : "—"}
            </p>
          </div>

          {aiPrice != null && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 md:col-span-2">
              <p className="text-sm font-medium">Рекомендация Claude</p>
              <p className="text-2xl font-semibold">{formatMoney(aiPrice, currency)}</p>
              {aiReasoning && <p className="mt-2 text-sm text-muted-foreground">{aiReasoning}</p>}
            </div>
          )}

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={handleRecommend} disabled={pending}>
              <Sparkles className="mr-2 h-4 w-4" />
              Рекомендация Claude
            </Button>
            <Button type="button" onClick={handleSave} disabled={pending || livePrice == null}>
              Сохранить сценарий
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История расчётов</CardTitle>
        </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">Сценариев пока нет</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Себестоимость</TableHead>
                  <TableHead>Маржа</TableHead>
                  <TableHead>Расчёт</TableHead>
                  <TableHead>Claude</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.map((scenario) => (
                  <TableRow key={scenario.id}>
                    <TableCell>{formatDate(scenario.created_at)}</TableCell>
                    <TableCell>{scenario.products?.name ?? "—"}</TableCell>
                    <TableCell>{formatMoney(scenario.cost, currency)}</TableCell>
                    <TableCell>{scenario.margin_percent}%</TableCell>
                    <TableCell>{formatMoney(scenario.calculated_price, currency)}</TableCell>
                    <TableCell>
                      {scenario.ai_recommended_price != null
                        ? formatMoney(scenario.ai_recommended_price, currency)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(scenario.id)}>
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
