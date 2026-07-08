import { Suspense } from "react";
import {
  createTransaction,
  deleteTransaction,
  listBankAccountOptions,
  listCategoryOptions,
  listTransactions,
  updateTransaction,
} from "@/app/actions/finance";
import { EntityCrud } from "@/components/crud/entity-crud";
import { CategorizeButton } from "@/components/finance/categorize-button";
import { StatementUploadButton } from "@/components/finance/statement-upload-button";
import {
  transactionColumns,
  transactionFields,
  transactionFilters,
} from "@/lib/crud/configs/finance";

const FINANCE_MODULE_NAV = [
  { href: "/finance", label: "Обзор" },
  { href: "/finance/transactions", label: "Транзакции", isActive: true },
  { href: "/finance/accounts", label: "Счета" },
];

type TransactionsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const filters = await searchParams;
  const [transactions, accountOptions, categoryOptions] = await Promise.all([
    listTransactions(filters),
    listBankAccountOptions(),
    listCategoryOptions(),
  ]);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EntityCrud
        title="Транзакции"
        description="Операции из выписок и ручного ввода. Автокатегоризация через Claude."
        rows={transactions}
        fields={transactionFields}
        filters={transactionFilters}
        columns={transactionColumns}
        dynamicOptions={{
          bank_account_id: accountOptions,
          category_id: categoryOptions,
        }}
        searchPlaceholder="Описание операции..."
        moduleNav={FINANCE_MODULE_NAV}
        headerActions={
          <>
            <StatementUploadButton accounts={accountOptions} />
            <CategorizeButton />
          </>
        }
        createAction={createTransaction}
        updateAction={updateTransaction}
        deleteAction={deleteTransaction}
      />
    </Suspense>
  );
}
