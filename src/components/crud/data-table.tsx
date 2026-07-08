"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ColumnConfig } from "@/types/database";

type DataTableProps<T extends { id: string }> = {
  rows: T[];
  columns: ColumnConfig<T>[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  detailHref?: (row: T) => string;
  emptyMessage?: string;
};

function getCellValue<T extends Record<string, unknown>>(row: T, key: string) {
  const value = row[key];
  if (value == null || value === "") return "—";
  return String(value);
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  onEdit,
  onDelete,
  detailHref,
  emptyMessage = "Нет данных",
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="w-28 text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render
                    ? column.render(row)
                    : detailHref && column.key === "name" ? (
                        <Link href={detailHref(row)} className="font-medium hover:underline">
                          {getCellValue(row as Record<string, unknown>, column.key)}
                        </Link>
                      ) : (
                        getCellValue(row as Record<string, unknown>, column.key)
                      )}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
