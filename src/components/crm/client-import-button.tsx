"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { importClientsCsv } from "@/app/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClientImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  async function handleImport(formData: FormData) {
    const result = await importClientsCsv(formData);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Импорт завершён");
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((value) => !value)} disabled={pending}>
        <Upload className="mr-2 h-4 w-4" />
        Импорт CSV
      </Button>
      {open && (
        <form
          action={handleImport}
          className="absolute right-0 z-10 mt-2 w-72 rounded-lg border bg-popover p-3 shadow-md"
        >
          <p className="mb-2 text-xs text-muted-foreground">
            Колонки: name, email, phone, total_purchases. TODO: Excel, дедупликация Claude.
          </p>
          <Input ref={inputRef} type="file" name="file" accept=".csv,text/csv" required />
          <Button type="submit" size="sm" className="mt-2 w-full" disabled={pending}>
            Загрузить
          </Button>
        </form>
      )}
    </div>
  );
}
