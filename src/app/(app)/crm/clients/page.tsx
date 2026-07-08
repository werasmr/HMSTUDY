import { Suspense } from "react";
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
} from "@/app/actions/crm";
import { EntityCrud } from "@/components/crud/entity-crud";
import { ClientImportButton } from "@/components/crm/client-import-button";
import {
  clientColumns,
  clientFields,
  clientFilters,
} from "@/lib/crud/configs/clients";

type ClientsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const filters = await searchParams;
  const clients = await listClients(filters);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EntityCrud
        title="Клиенты"
        description="CRM и база клиентов в одной таблице"
        rows={clients}
        fields={clientFields}
        filters={clientFilters}
        columns={clientColumns}
        searchPlaceholder="Имя, email, телефон..."
        detailHref={(row) => `/crm/clients/${row.id}`}
        headerActions={<ClientImportButton />}
        createAction={createClient}
        updateAction={updateClient}
        deleteAction={deleteClient}
      />
    </Suspense>
  );
}
