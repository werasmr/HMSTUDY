import { Suspense } from "react";
import {
  createTask,
  deleteTask,
  listClientOptions,
  listDealOptions,
  listTasks,
  updateTask,
} from "@/app/actions/crm";
import { EntityCrud } from "@/components/crud/entity-crud";
import { taskColumns, taskFields, taskFilters } from "@/lib/crud/configs/tasks";

type TasksPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const filters = await searchParams;
  const [tasks, clientOptions, dealOptions] = await Promise.all([
    listTasks(filters),
    listClientOptions(),
    listDealOptions(),
  ]);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <EntityCrud
        title="Задачи"
        description="Задачи по клиентам и сделкам"
        rows={tasks}
        fields={taskFields}
        filters={taskFilters}
        columns={taskColumns}
        dynamicOptions={{
          entity_id: [...clientOptions, ...dealOptions],
        }}
        searchPlaceholder="Название задачи..."
        createAction={createTask}
        updateAction={updateTask}
        deleteAction={deleteTask}
      />
    </Suspense>
  );
}
