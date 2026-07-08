"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addClientInteraction } from "@/app/actions/crm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CLIENT_SEGMENT_LABELS,
  CLIENT_STATUS_LABELS,
  formatDate,
  formatMoney,
} from "@/lib/crud/utils";
import type { Client, ClientInteraction } from "@/types/database";

type ClientDetailProps = {
  client: Client;
  interactions: ClientInteraction[];
};

export function ClientDetail({ client, interactions }: ClientDetailProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleAddInteraction(formData: FormData) {
    const result = await addClientInteraction(client.id, formData);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Запись добавлена");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
        <p className="text-muted-foreground">Карточка клиента и история взаимодействий</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Контакты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Email: {client.email ?? "—"}</p>
            <p>Телефон: {client.phone ?? "—"}</p>
            <p>Источник: {client.source ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Статус</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>{CLIENT_STATUS_LABELS[client.status]}</Badge>
            <Badge variant="outline">{CLIENT_SEGMENT_LABELS[client.segment]}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Покупки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMoney(client.total_purchases)}</p>
            <p className="text-xs text-muted-foreground">
              Сегмент пересчитывается автоматически по порогам компании
            </p>
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Заметки</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{client.notes}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Добавить в историю</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleAddInteraction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Тип</Label>
              <select
                id="type"
                name="type"
                defaultValue="note"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="note">Заметка</option>
                <option value="call">Звонок</option>
                <option value="email">Email</option>
                <option value="meeting">Встреча</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input id="title" name="title" placeholder="Кратко о контакте" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="content">Описание</Label>
              <Textarea id="content" name="content" rows={3} />
            </div>
            <Button type="submit" disabled={pending}>
              Добавить
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">История</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {interactions.length === 0 && (
            <p className="text-sm text-muted-foreground">История пока пуста</p>
          )}
          {interactions.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{item.title ?? item.type}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </span>
              </div>
              {item.content && (
                <p className="mt-2 text-sm text-muted-foreground">{item.content}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
