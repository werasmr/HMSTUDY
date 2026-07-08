"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataForm } from "@/components/crud/data-form";
import { DataTable } from "@/components/crud/data-table";
import { FilterBar } from "@/components/crud/filter-bar";
import type {
  ColumnConfig,
  CrudActionResult,
  FieldConfig,
  FilterConfig,
  SelectOption,
} from "@/types/database";

type EntityCrudProps<T extends { id: string }> = {
  title: string;
  description?: string;
  rows: T[];
  fields: FieldConfig[];
  filters?: FilterConfig[];
  columns: ColumnConfig<T>[];
  dynamicOptions?: Record<string, SelectOption[]>;
  searchPlaceholder?: string;
  detailHref?: (row: T) => string;
  headerActions?: React.ReactNode;
  formFooter?: (props: { formId: string }) => React.ReactNode;
  createAction: (formData: FormData) => Promise<CrudActionResult | void>;
  updateAction: (id: string, formData: FormData) => Promise<CrudActionResult | void>;
  deleteAction: (id: string) => Promise<CrudActionResult | void>;
};

function rowToValues<T extends Record<string, unknown>>(row: T, fields: FieldConfig[]) {
  return Object.fromEntries(
    fields.map((field) => [field.key, row[field.key] == null ? "" : String(row[field.key])]),
  );
}

export function EntityCrud<T extends { id: string }>({
  title,
  description,
  rows,
  fields,
  filters = [],
  columns,
  dynamicOptions = {},
  searchPlaceholder,
  detailHref,
  headerActions,
  formFooter,
  createAction,
  updateAction,
  deleteAction,
}: EntityCrudProps<T>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const formId = useMemo(() => `crud-form-${title.replace(/\s+/g, "-").toLowerCase()}`, [title]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    const result = editing
      ? await updateAction(editing.id, formData)
      : await createAction(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(editing ? "Запись обновлена" : "Запись создана");
    setOpen(false);
    setEditing(null);
    refresh();
  }

  async function handleDelete(row: T) {
    if (!window.confirm("Удалить запись?")) return;

    const result = await deleteAction(row.id);
    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Запись удалена");
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {headerActions}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
      </div>

      {filters.length > 0 && (
        <FilterBar filters={filters} searchPlaceholder={searchPlaceholder} />
      )}

      <DataTable
        rows={rows}
        columns={columns}
        onEdit={openEdit}
        onDelete={handleDelete}
        detailHref={detailHref}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? "Редактирование" : "Новая запись"}</SheetTitle>
            <SheetDescription>{title}</SheetDescription>
          </SheetHeader>

          <form
            id={formId}
            action={handleSubmit}
            className="px-4 pb-4"
            onSubmit={(event) => {
              if (isPending) event.preventDefault();
            }}
          >
            <DataForm
              formId={formId}
              fields={fields}
              values={editing ? rowToValues(editing as Record<string, unknown>, fields) : undefined}
              dynamicOptions={dynamicOptions}
            />
            {formFooter?.({ formId })}
          </form>

          <SheetFooter>
            <Button type="submit" form={formId} disabled={isPending}>
              {editing ? "Сохранить" : "Создать"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
