"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">Что-то пошло не так</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Произошла ошибка при загрузке страницы. Попробуйте обновить или вернитесь на дашборд.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Код: {error.digest}</p>
      )}
      <div className="flex gap-2">
        <button type="button" className={cn(buttonVariants())} onClick={reset}>
          Повторить
        </button>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
          На дашборд
        </Link>
      </div>
    </div>
  );
}
