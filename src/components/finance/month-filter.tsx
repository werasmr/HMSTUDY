"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current =
    searchParams.get("month") ??
    new Date().toISOString().slice(0, 7);

  return (
    <Card className="border-dashed bg-card/80">
      <CardContent className="pt-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const month = String(formData.get("month") ?? "");
            router.push(`/finance?month=${month}`);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="month" className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Месяц
            </Label>
            <Input
              id="month"
              name="month"
              type="month"
              defaultValue={current}
              className="w-full min-w-[180px] bg-background sm:w-auto"
            />
          </div>
          <Button type="submit" className="sm:mb-0.5">
            Показать
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
