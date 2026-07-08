import { notFound } from "next/navigation";
import { getCompetitor, listCompetitorItems } from "@/app/actions/competitors";
import { CompetitorDetail } from "@/components/competitors/competitor-detail";

type CompetitorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompetitorPage({ params }: CompetitorPageProps) {
  const { id } = await params;

  try {
    const [competitor, items] = await Promise.all([
      getCompetitor(id),
      listCompetitorItems(id),
    ]);

    return <CompetitorDetail competitor={competitor} items={items} />;
  } catch {
    notFound();
  }
}
