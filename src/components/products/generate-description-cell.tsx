"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateAndSaveDescription } from "@/app/actions/products";
import { Button } from "@/components/ui/button";

type GenerateDescriptionCellProps = {
  productId: string;
  hasDescription: boolean;
};

export function GenerateDescriptionCell({
  productId,
  hasDescription,
}: GenerateDescriptionCellProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleGenerate() {
    const result = await generateAndSaveDescription(productId);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(hasDescription ? "Описание обновлено" : "Описание сгенерировано");
    startTransition(() => router.refresh());
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={pending}>
      <Sparkles className="mr-1 h-3 w-3" />
      {pending ? "..." : "AI"}
    </Button>
  );
}
