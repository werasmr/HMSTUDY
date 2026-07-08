"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { FilterConfig } from "@/types/database";

type FilterBarProps = {
  filters: FilterConfig[];
  searchPlaceholder?: string;
};

export function FilterBar({ filters, searchPlaceholder = "Поиск..." }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      <div className="space-y-2 md:min-w-64">
        <Label htmlFor="search">Поиск</Label>
        <Input
          id="search"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder={searchPlaceholder}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateParam("q", event.currentTarget.value);
            }
          }}
        />
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="space-y-2 md:min-w-44">
          <Label>{filter.label}</Label>
          <Select
            value={searchParams.get(filter.key) ?? "all"}
            onValueChange={(value) => updateParam(filter.key, value ?? "all")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={() => {
          const q = (document.getElementById("search") as HTMLInputElement | null)?.value ?? "";
          updateParam("q", q);
        }}
      >
        Применить
      </Button>
    </div>
  );
}
