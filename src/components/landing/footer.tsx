import Link from "next/link";
import { NAV_LINKS } from "@/components/landing/data";

const SOCIAL = [
  { label: "Telegram", href: "#" },
  { label: "VK", href: "#" },
  { label: "YouTube", href: "#" },
];

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/20 px-4 py-12 md:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold">Proto</p>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-платформа автоматизации малого бизнеса
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Навигация</p>
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Продукт</p>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Войти
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Регистрация
            </Link>
          </nav>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Соцсети</p>
          <nav className="flex flex-col gap-2">
            {SOCIAL.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label} (скоро)
              </a>
            ))}
          </nav>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Proto. Все права защищены.
      </p>
    </footer>
  );
}
