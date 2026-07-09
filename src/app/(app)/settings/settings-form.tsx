"use client";

import { useState } from "react";
import { updateCompanySettings, updateProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BUSINESS_TYPE_OPTIONS } from "@/lib/business-types";
import type { UserContext } from "@/types/database";

type SettingsPageClientProps = {
  ctx: UserContext;
};

export function SettingsPageClient({ ctx }: SettingsPageClientProps) {
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [companyMessage, setCompanyMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">Профиль и параметры компании</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              const result = await updateProfile(formData);
              setProfileMessage(result?.error ?? "Сохранено");
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">Имя</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={ctx.profile.full_name ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={ctx.profile.email} disabled />
            </div>
            {profileMessage && (
              <p className="text-sm text-muted-foreground">{profileMessage}</p>
            )}
            <Button type="submit">Сохранить профиль</Button>
          </form>
        </CardContent>
      </Card>

      {ctx.membership.role === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle>Компания</CardTitle>
            <CardDescription>
              Пороги сегментации клиентов хранятся в settings и применяются автоматически по
              total_purchases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                const result = await updateCompanySettings(formData);
                setCompanyMessage(result?.error ?? "Сохранено");
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input id="name" name="name" defaultValue={ctx.company.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Тип бизнеса</Label>
                <select
                  id="businessType"
                  name="businessType"
                  defaultValue={ctx.company.business_type ?? "other"}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {BUSINESS_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Определяет KPI и рекомендации AI CEO для вашей ниши.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <Input
                    id="currency"
                    name="currency"
                    defaultValue={ctx.company.settings.currency}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    defaultValue={ctx.company.settings.timezone}
                  />
                </div>
              </div>
              <Separator />
              <p className="text-sm font-medium">Пороги сегментации (₽)</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="segment_vip">VIP</Label>
                  <Input
                    id="segment_vip"
                    name="segment_vip"
                    type="number"
                    defaultValue={ctx.company.settings.segment_thresholds.vip}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment_regular">Regular</Label>
                  <Input
                    id="segment_regular"
                    name="segment_regular"
                    type="number"
                    defaultValue={ctx.company.settings.segment_thresholds.regular}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment_low_value">Low value</Label>
                  <Input
                    id="segment_low_value"
                    name="segment_low_value"
                    type="number"
                    defaultValue={ctx.company.settings.segment_thresholds.low_value}
                  />
                </div>
              </div>
              {companyMessage && (
                <p className="text-sm text-muted-foreground">{companyMessage}</p>
              )}
              <Button type="submit">Сохранить компанию</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
