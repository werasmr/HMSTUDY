"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/crud/utils";
import type { ComparisonRow, Competitor } from "@/types/database";

type ComparisonTableProps = {
  rows: ComparisonRow[];
  competitors: Competitor[];
  currency: string;
};

function priceDiff(ourPrice: number | null, theirPrice: number | null) {
  if (ourPrice == null || theirPrice == null) return null;
  return ourPrice - theirPrice;
}

export function ComparisonTable({ rows, competitors, currency }: ComparisonTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Сравнение с конкурентами</h1>
          <p className="text-muted-foreground">
            Сопоставление по названию товара/услуги. TODO: автопарсинг.
          </p>
        </div>
        <Link href="/competitors" className="text-sm text-primary hover:underline">
          ← Список конкурентов
        </Link>
      </div>

      {competitors.length === 0 ? (
        <p className="text-sm text-muted-foreground">Добавьте конкурентов и их цены</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар/услуга</TableHead>
                <TableHead>Наша цена</TableHead>
                {competitors.map((competitor) => (
                  <TableHead key={competitor.id}>
                    <Link href={`/competitors/${competitor.id}`} className="hover:underline">
                      {competitor.name}
                    </Link>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2 + competitors.length} className="text-center text-muted-foreground">
                    Нет данных для сравнения
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.productName}>
                  <TableCell className="font-medium">{row.productName}</TableCell>
                  <TableCell>
                    {row.ourPrice != null ? formatMoney(row.ourPrice, currency) : "—"}
                  </TableCell>
                  {row.competitorPrices.map((entry) => {
                    const diff = priceDiff(row.ourPrice, entry.price);
                    return (
                      <TableCell key={entry.competitorId}>
                        {entry.price != null ? (
                          <div>
                            <div>{formatMoney(entry.price, entry.currency)}</div>
                            {diff != null && (
                              <div
                                className={
                                  diff < 0
                                    ? "text-xs text-red-600"
                                    : diff > 0
                                      ? "text-xs text-green-600"
                                      : "text-xs text-muted-foreground"
                                }
                              >
                                {diff > 0 ? "+" : ""}
                                {formatMoney(diff, currency)}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
