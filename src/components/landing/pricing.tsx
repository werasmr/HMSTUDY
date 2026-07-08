"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPARISON_ROWS, PLANS } from "@/components/landing/data";
import { Section } from "@/components/landing/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <Section id="pricing" className="px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Тарифы</h2>
          <p className="mt-3 text-muted-foreground">Прозрачные планы без скрытых платежей</p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-all",
                !yearly ? "bg-background shadow" : "text-muted-foreground",
              )}
            >
              Месяц
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-all",
                yearly ? "bg-background shadow" : "text-muted-foreground",
              )}
            >
              Год
            </button>
            {yearly && (
              <Badge variant="secondary" className="mr-1">
                −17%
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  plan.highlighted && "border-primary shadow-md",
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Рекомендуем</Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <p className="pt-2 text-3xl font-bold">
                    {price === 0 ? "0 ₽" : `${price.toLocaleString("ru-RU")} ₽`}
                    <span className="text-sm font-normal text-muted-foreground">/мес</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/register"
                    className={cn(buttonVariants({ variant: plan.highlighted ? "default" : "outline" }), "w-full")}
                  >
                    {plan.cta}
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setShowComparison((value) => !value)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {showComparison ? "Скрыть сравнение" : "Сравнить все возможности"}
          </button>
        </div>

        {showComparison && (
          <div className="mt-6 overflow-x-auto rounded-lg border animate-in fade-in duration-300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Возможность</TableHead>
                  <TableHead>Free</TableHead>
                  <TableHead>Starter</TableHead>
                  <TableHead>Pro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell>{row.feature}</TableCell>
                    <TableCell>{row.free}</TableCell>
                    <TableCell>{row.starter}</TableCell>
                    <TableCell>{row.pro}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Section>
  );
}
