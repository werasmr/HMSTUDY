import { Suspense } from "react";
import {
  createDeal,
  deleteDeal,
  listClientOptions,
  listDeals,
  updateDeal,
} from "@/app/actions/crm";
import { EntityCrud } from "@/components/crud/entity-crud";
import { dealColumns, dealFields, dealFilters } from "@/lib/crud/configs/deals";

type DealsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const filters = await searchParams;
  const [deals, clientOptions] = await Promise.all([listDeals(filters), listClientOptions()]);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EntityCrud
        title="Сделки"
        description="Воронка: лид → квалификация → предложение → переговоры → результат"
        rows={deals}
        fields={dealFields}
        filters={dealFilters}
        columns={dealColumns}
        dynamicOptions={{ client_id: clientOptions }}
        searchPlaceholder="Название сделки..."
        createAction={createDeal}
        updateAction={updateDeal}
        deleteAction={deleteDeal}
      />
    </Suspense>
  );
}
