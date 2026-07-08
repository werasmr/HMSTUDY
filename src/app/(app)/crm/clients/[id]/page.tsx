import { notFound } from "next/navigation";
import { getClient, listClientInteractions } from "@/app/actions/crm";
import { ClientDetail } from "@/components/crm/client-detail";

type ClientPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;

  try {
    const [client, interactions] = await Promise.all([
      getClient(id),
      listClientInteractions(id),
    ]);

    return <ClientDetail client={client} interactions={interactions} />;
  } catch {
    notFound();
  }
}
