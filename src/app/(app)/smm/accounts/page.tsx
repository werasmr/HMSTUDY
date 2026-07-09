import { Suspense } from "react";
import {
  createSocialAccount,
  deleteSocialAccount,
  listSocialAccounts,
  updateSocialAccount,
} from "@/app/actions/smm";
import { EntityCrud } from "@/components/crud/entity-crud";
import { socialAccountColumns, socialAccountFields } from "@/lib/crud/configs/smm";

const SMM_NAV = [
  { href: "/smm", label: "Посты" },
  { href: "/smm/accounts", label: "Аккаунты", isActive: true },
];

export default async function SmmAccountsPage() {
  const accounts = await listSocialAccounts();

  return (
    <Suspense fallback={null}>
      <EntityCrud
        title="SMM-аккаунты"
        description="Каналы для публикаций. Автопостинг в Telegram — в следующих версиях."
        rows={accounts}
        fields={socialAccountFields}
        columns={socialAccountColumns}
        moduleNav={SMM_NAV}
        createAction={createSocialAccount}
        updateAction={updateSocialAccount}
        deleteAction={deleteSocialAccount}
      />
    </Suspense>
  );
}
