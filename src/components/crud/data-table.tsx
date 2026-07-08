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
      <div className="border-dashed p-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          {columns.map((column) => (
            <TableHead key={column.key} className="font-semibold">
              {column.label}
            </TableHead>
          ))}
          <TableHead className="w-28 text-right font-semibold">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} className="hover:bg-muted/30">
            {columns.map((column, columnIndex) => (
              <TableCell key={column.key}>
                {column.render
                  ? column.render(row)
                  : detailHref && columnIndex === 0 ? (
                      <Link
                        href={detailHref(row)}
                        className="font-medium text-primary hover:underline"
                      >
                        {getCellValue(row as Record<string, unknown>, column.key)}
                      </Link>
                    ) : (
                      getCellValue(row as Record<string, unknown>, column.key)
                    )}
              </TableCell>
            ))}
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="outline" size="icon-sm" onClick={() => onEdit(row)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onDelete(row)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
