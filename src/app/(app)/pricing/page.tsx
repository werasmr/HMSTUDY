import { listPricingScenarios, listProductOptions } from "@/app/actions/pricing";
import { getUserContext } from "@/lib/auth";
import { PricingCalculator } from "@/components/pricing/pricing-calculator";
import { redirect } from "next/navigation";

export default async function PricingPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect("/onboarding");

  const [products, scenarios] = await Promise.all([
    listProductOptions(),
    listPricingScenarios(),
  ]);

  return (
    <PricingCalculator
      products={products}
      scenarios={scenarios}
      currency={ctx.company.settings.currency}
    />
  );
}
