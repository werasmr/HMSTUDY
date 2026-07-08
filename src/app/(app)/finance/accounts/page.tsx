import { Suspense } from "react";
import {
  createBankAccount,
  deleteBankAccount,
  listBankAccounts,
  updateBankAccount,
} from "@/app/actions/finance";
import { EntityCrud } from "@/components/crud/entity-crud";
import {
  bankAccountColumns,
  bankAccountFields,
} from "@/lib/crud/configs/finance";

const FINANCE_MODULE_NAV = [
  { href: "/finance", label: "Обзор" },
  { href: "/finance/transactions", label: "Транзакции" },
  { href: "/finance/accounts", label: "Счета", isActive: true },
];

export default async function AccountsPage() {
  const accounts = await listBankAccounts();

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EntityCrud
        title="Банковские счета"
        description="Ручные счета для привязки выписок. TODO: прямые интеграции с банками."
        rows={accounts}
        fields={bankAccountFields}
        columns={bankAccountColumns}
        moduleNav={FINANCE_MODULE_NAV}
        createAction={createBankAccount}
        updateAction={updateBankAccount}
        deleteAction={deleteBankAccount}
      />
    </Suspense>
  );
}
