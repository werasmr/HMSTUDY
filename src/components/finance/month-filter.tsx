"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current =
    searchParams.get("month") ??
    new Date().toISOString().slice(0, 7);

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const month = String(formData.get("month") ?? "");
        router.push(`/finance?month=${month}`);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="month">Месяц</Label>
        <Input id="month" name="month" type="month" defaultValue={current} />
      </div>
      <Button type="submit" variant="outline">
        Показать
      </Button>
    </form>
  );
}
