import Link from "next/link";
import { Suspense } from "react";
import {
  createCompetitor,
  deleteCompetitor,
  listCompetitors,
  updateCompetitor,
} from "@/app/actions/competitors";
import { EntityCrud } from "@/components/crud/entity-crud";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  competitorColumns,
  competitorFields,
} from "@/lib/crud/configs/competitors";

type CompetitorsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CompetitorsPage({ searchParams }: CompetitorsPageProps) {
  const filters = await searchParams;
  const competitors = await listCompetitors(filters);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EntityCrud
        title="Конкуренты"
        description="Ручной ввод цен конкурентов. TODO: автопарсинг."
        rows={competitors}
        fields={competitorFields}
        columns={competitorColumns}
        searchPlaceholder="Название конкурента..."
        detailHref={(row) => `/competitors/${row.id}`}
        headerActions={
          <Link href="/competitors/compare" className={cn(buttonVariants({ variant: "outline" }))}>
            Сравнение
          </Link>
        }
        createAction={createCompetitor}
        updateAction={updateCompetitor}
        deleteAction={deleteCompetitor}
      />
    </Suspense>
  );
}
