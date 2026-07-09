"use client";

import { useState } from "react";
import Link from "next/link";
import { HERO_TABS, type HeroTabId } from "@/components/landing/data";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<HeroTabId>("finance");

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 md:px-6 md:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      {/* Animated ambient blobs */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 -z-10 h-96 w-96 animate-blob rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-32 -z-10 h-96 w-96 animate-blob rounded-full bg-primary/10 blur-3xl [animation-delay:2s]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="animate-fade-in-up">
          <p className="mb-4 inline-flex rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">
            AI-инструмент автоматизации бизнеса
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Proto заменяет 7 сервисов одним инструментом
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Финансы, клиенты, сотрудники, цены, конкуренты и соцсети — в одной системе, которой
            управляет Claude. Меньше рутины и переключений между вкладками — больше решений,
            которые приносят деньги.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "transition-transform hover:scale-[1.03]")}
            >
              Попробовать бесплатно
            </Link>
            <a
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "transition-transform hover:scale-[1.03]",
              )}
            >
              Смотреть возможности
            </a>
          </div>
        </div>

        <div className="animate-fade-in-up [animation-delay:150ms]">
          <div className="mb-3 flex flex-wrap gap-2">
            {HERO_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-all duration-200",
                  activeTab === tab.id
                    ? "scale-105 bg-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div key={activeTab} className="animate-fade-in">
            <DashboardMockup activeTab={activeTab} />
          </div>
        </div>
      </div>
    </section>
  );
}
