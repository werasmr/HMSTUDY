"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { importStatement } from "@/app/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SelectOption } from "@/types/database";

type StatementUploadButtonProps = {
  accounts: SelectOption[];
};

export function StatementUploadButton({ accounts }: StatementUploadButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  if (accounts.length === 0) {
    return (
      <Button variant="outline" disabled>
        Сначала создайте счёт
      </Button>
    );
  }

  async function handleImport(formData: FormData) {
    const result = await importStatement(formData);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Выписка загружена, транзакции импортированы");
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((value) => !value)} disabled={pending}>
        <Upload className="mr-2 h-4 w-4" />
        Загрузить выписку
      </Button>
      {open && (
        <form
          action={handleImport}
          className="absolute right-0 z-10 mt-2 w-80 rounded-lg border bg-popover p-3 shadow-md"
        >
          <p className="mb-3 text-xs text-muted-foreground">
            CSV или Excel. Колонки: дата, сумма (или дебет/кредит), описание.
            TODO: прямые банковские API.
          </p>
          <div className="space-y-2">
            <Label htmlFor="bank_account_id">Счёт</Label>
            <select
              id="bank_account_id"
              name="bank_account_id"
              required
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              defaultValue={accounts[0]?.value}
            >
              {accounts.map((account) => (
                <option key={account.value} value={account.value}>
                  {account.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 space-y-2">
            <Label htmlFor="statement-file">Файл</Label>
            <Input
              ref={inputRef}
              id="statement-file"
              type="file"
              name="file"
              accept=".csv,.xlsx,.xls,text/csv"
              required
            />
          </div>
          <Button type="submit" size="sm" className="mt-3 w-full" disabled={pending}>
            Импортировать
          </Button>
        </form>
      )}
    </div>
  );
}
