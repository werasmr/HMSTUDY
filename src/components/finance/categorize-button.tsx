"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { categorizeUncategorizedTransactions } from "@/app/actions/finance";
import { Button } from "@/components/ui/button";

export function CategorizeButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const result = await categorizeUncategorizedTransactions();
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Категории назначены");
    startTransition(() => router.refresh());
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={pending}>
      <Sparkles className="mr-2 h-4 w-4" />
      {pending ? "Claude..." : "Автокатегоризация"}
    </Button>
  );
}
