import { notFound } from "next/navigation";
import { getEmployee, listEmployeeKpis } from "@/app/actions/employees";
import { EmployeeDetail } from "@/components/employees/employee-detail";

type EmployeePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function EmployeePage({ params, searchParams }: EmployeePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const month = query.month ?? new Date().toISOString().slice(0, 7);

  try {
    const [employee, kpis] = await Promise.all([
      getEmployee(id),
      listEmployeeKpis(id),
    ]);

    return <EmployeeDetail employee={employee} kpis={kpis} month={month} />;
  } catch {
    notFound();
  }
}
