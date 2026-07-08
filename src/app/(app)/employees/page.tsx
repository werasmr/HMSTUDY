import Link from "next/link";
import { Suspense } from "react";
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from "@/app/actions/employees";
import { EntityCrud } from "@/components/crud/entity-crud";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  employeeColumns,
  employeeFields,
  employeeFilters,
} from "@/lib/crud/configs/employees";

type EmployeesPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const filters = await searchParams;
  const employees = await listEmployees(filters);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EntityCrud
        title="Сотрудники"
        description="Карточки сотрудников и ручной ввод KPI"
        rows={employees}
        fields={employeeFields}
        filters={employeeFilters}
        columns={employeeColumns}
        searchPlaceholder="ФИО, должность, отдел..."
        detailHref={(row) => `/employees/${row.id}`}
        headerActions={
          <Link
            href="/employees/performance"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Эффективность
          </Link>
        }
        createAction={createEmployee}
        updateAction={updateEmployee}
        deleteAction={deleteEmployee}
      />
    </Suspense>
  );
}
