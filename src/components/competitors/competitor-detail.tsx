"use client";

import Link from "next/link";
import {
  createCompetitorItem,
  deleteCompetitorItem,
  updateCompetitorItem,
} from "@/app/actions/competitors";
import { EntityCrud } from "@/components/crud/entity-crud";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  competitorItemColumns,
  competitorItemFields,
} from "@/lib/crud/configs/competitors";
import type { Competitor, CompetitorItem } from "@/types/database";

type CompetitorDetailProps = {
  competitor: Competitor;
  items: CompetitorItem[];
};

export function CompetitorDetail({ competitor, items }: CompetitorDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{competitor.name}</h1>
          <p className="text-muted-foreground">Цены и товары конкурента (ручной ввод)</p>
        </div>
        <Link href="/competitors/compare" className="text-sm text-primary hover:underline">
          Таблица сравнения →
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Сайт: {competitor.website ?? "—"}</p>
          {competitor.notes && <p className="text-muted-foreground">{competitor.notes}</p>}
        </CardContent>
      </Card>

      <EntityCrud
        title="Позиции конкурента"
        description="Цены и позиции конкурента. Автопарсинг — в следующих версиях."
        rows={items}
        fields={competitorItemFields}
        columns={competitorItemColumns}
        createAction={(formData) => createCompetitorItem(competitor.id, formData)}
        updateAction={(id, formData) => updateCompetitorItem(competitor.id, id, formData)}
        deleteAction={(id) => deleteCompetitorItem(competitor.id, id)}
      />
    </div>
  );
}
