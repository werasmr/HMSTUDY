import { getComparisonTable } from "@/app/actions/competitors";
import { ComparisonTable } from "@/components/competitors/comparison-table";

export default async function ComparePage() {
  const { rows, competitors, currency } = await getComparisonTable();

  return <ComparisonTable rows={rows} competitors={competitors} currency={currency} />;
}
