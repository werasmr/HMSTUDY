"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateDescriptionFromForm } from "@/app/actions/products";
import { Button } from "@/components/ui/button";

type DescriptionGeneratorProps = {
  formId: string;
};

export function DescriptionGenerator({ formId }: DescriptionGeneratorProps) {
  const [pending, setPending] = useState(false);

  async function handleGenerate() {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    setPending(true);
    const formData = new FormData(form);
    const result = await generateDescriptionFromForm(formData);

    if (result.error) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    const textarea = document.getElementById(`${formId}-description`) as HTMLTextAreaElement | null;
    if (textarea && result.description) {
      textarea.value = result.description;
    }

    toast.success("Описание сгенерировано");
    setPending(false);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={pending}>
      <Sparkles className="mr-2 h-4 w-4" />
      {pending ? "Генерация..." : "Сгенерировать описание"}
    </Button>
  );
}
