import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">Страница не найдена</h1>
      <p className="max-w-md text-muted-foreground">
        Такой страницы нет или она была перемещена.
      </p>
      <div className="flex gap-2">
        <Link href="/" className={cn(buttonVariants())}>
          На главную
        </Link>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
          В приложение
        </Link>
      </div>
    </div>
  );
}
