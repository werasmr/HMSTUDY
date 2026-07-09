"use client";

import { useMemo, useState } from "react";
import { Section } from "@/components/landing/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAnimatedNumber } from "@/hooks/use-animated-number";

export function SavingsCalculatorSection() {
  const [employees, setEmployees] = useState(5);
  const [clients, setClients] = useState(200);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);

  const result = useMemo(() => {
    const hoursSaved = Math.round(
      employees * 2 + clients * 0.05 + hoursPerWeek * 3.5,
    );
    const moneySaved = hoursSaved * 1200;
    return { hoursSaved, moneySaved };
  }, [employees, clients, hoursPerWeek]);

  const animatedHours = useAnimatedNumber(result.hoursSaved);
  const animatedMoney = useAnimatedNumber(result.moneySaved);

  return (
    <Section className="bg-muted/30 px-4 py-20 md:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Калькулятор экономии</h2>
          <p className="mt-3 text-muted-foreground">
            Оцените, сколько времени и денег Proto сэкономит вашей команде в месяц
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ваши параметры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="employees">Сотрудников: {employees}</Label>
              <input
                id="employees"
                type="range"
                min={1}
                max={50}
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clients">Клиентов в базе: {clients}</Label>
              <input
                id="clients"
                type="range"
                min={10}
                max={5000}
                step={10}
                value={clients}
                onChange={(e) => setClients(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Часов в неделю на рутину: {hoursPerWeek}</Label>
              <Input
                id="hours"
                type="number"
                min={1}
                max={40}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value) || 0)}
              />
            </div>

            <div className="grid gap-4 rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6 sm:grid-cols-2">
              <div className="transition-transform duration-300 hover:scale-[1.03]">
                <p className="text-sm text-muted-foreground">Экономия времени</p>
                <p className="text-3xl font-bold tabular-nums">{animatedHours} ч/мес</p>
              </div>
              <div className="transition-transform duration-300 hover:scale-[1.03]">
                <p className="text-sm text-muted-foreground">Экономия денег</p>
                <p className="text-3xl font-bold tabular-nums">
                  {animatedMoney.toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * Расчёт на клиенте: формула учитывает размер команды, базу клиентов и часы рутины.
              Не является финансовой гарантией.
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
