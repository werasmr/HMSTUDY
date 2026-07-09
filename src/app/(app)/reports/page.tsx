import { listDailyReports } from "@/app/actions/reports";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsList } from "@/components/reports/reports-list";

export default async function ReportsPage() {
  const reports = await listDailyReports();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ежедневные отчёты"
        description="AI CEO собирает финансы, клиентов, задачи и KPI команды в короткий управленческий отчёт."
      />
      <ReportsList reports={reports} />
    </div>
  );
}
