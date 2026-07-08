"use client";

import { cn } from "@/lib/utils";
import type { HeroTabId } from "@/components/landing/data";

function Bar({ width, tone = "default" }: { width: string; tone?: "default" | "green" | "red" }) {
  return (
    <div
      className={cn(
        "h-2 rounded-full",
        tone === "green" && "bg-green-500/70",
        tone === "red" && "bg-red-400/70",
        tone === "default" && "bg-primary/60",
      )}
      style={{ width }}
    />
  );
}

export function DashboardMockup({ activeTab }: { activeTab: HeroTabId }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <span className="ml-2 text-xs text-muted-foreground">app.proto.ru — {activeTab}</span>
      </div>

      <div className="grid min-h-[280px] grid-cols-[140px_1fr] md:min-h-[320px]">
        <aside className="hidden border-r bg-muted/20 p-3 sm:block">
          <p className="mb-3 text-xs font-semibold">Proto</p>
          {["Дашборд", "CRM", "Финансы", "Сотрудники"].map((item) => (
            <div
              key={item}
              className={cn(
                "mb-1 rounded-md px-2 py-1.5 text-xs",
                (activeTab === "crm" && item === "CRM") ||
                  (activeTab === "finance" && item === "Финансы") ||
                  (activeTab === "employees" && item === "Сотрудники") ||
                  (activeTab === "analytics" && item === "Дашборд")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item}
            </div>
          ))}
        </aside>

        <div className="p-4 md:p-6">
          {activeTab === "finance" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Баланс", value: "350 000 ₽" },
                  { label: "Доходы", value: "1,24 млн" },
                  { label: "Расходы", value: "890 тыс" },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg border p-2">
                    <p className="text-[10px] text-muted-foreground">{card.label}</p>
                    <p className="text-sm font-semibold">{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Bar width="85%" tone="green" />
                <Bar width="62%" tone="red" />
                <Bar width="48%" tone="red" />
                <Bar width="35%" tone="green" />
              </div>
            </div>
          )}

          {activeTab === "crm" && (
            <div className="space-y-2 animate-in fade-in duration-300">
              {[
                ["ООО Ромашка", "Сделка 120 000 ₽"],
                ["ИП Сидоров", "Лид — звонок"],
                ["СтройКомплект", "VIP — 420 000 ₽"],
              ].map(([name, meta]) => (
                <div key={name} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">{meta}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "employees" && (
            <div className="space-y-3 animate-in fade-in duration-300">
              {[
                { name: "Анна К.", kpi: "112%" },
                { name: "Игорь М.", kpi: "89%" },
                { name: "Мария П.", kpi: "104%" },
              ].map((row) => (
                <div key={row.name} className="flex items-center gap-3">
                  <span className="w-20 text-sm">{row.name}</span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: row.kpi }}
                    />
                  </div>
                  <span className="text-xs font-medium">{row.kpi}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-4 grid grid-cols-4 items-end gap-2 h-32">
                {[40, 65, 52, 80, 58, 72, 90, 68].map((h, i) => (
                  <div
                    key={i}
                    className="rounded-t-md bg-primary/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Объединённая аналитика: CRM + финансы + команда
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturePreview({ featureId }: { featureId: string }) {
  const previews: Record<string, React.ReactNode> = {
    crm: (
      <div className="space-y-2 p-4">
        <div className="rounded border p-2 text-sm">Клиенты • 248</div>
        <div className="rounded border p-2 text-sm">Сделки в работе • 34</div>
      </div>
    ),
    finance: (
      <div className="space-y-2 p-4">
        <Bar width="90%" tone="green" />
        <Bar width="70%" tone="red" />
        <Bar width="55%" tone="red" />
      </div>
    ),
    products: <div className="p-4 text-sm text-muted-foreground">Каталог • 56 позиций</div>,
    employees: <div className="p-4 text-sm">KPI команды • март</div>,
    competitors: <div className="p-4 text-sm">Сравнение • 4 конкурента</div>,
    "pricing-mod": <div className="p-4 text-sm">Маржа 32% → 4 990 ₽</div>,
    ai: <div className="p-4 text-sm italic text-muted-foreground">«Прибыль за март: 350 тыс ₽»</div>,
  };

  return (
    <div className="min-h-[100px] rounded-lg border bg-muted/30">
      {previews[featureId] ?? null}
    </div>
  );
}

export function FeatureMiniPreview({ featureId }: { featureId: string }) {
  return <FeaturePreview featureId={featureId} />;
}

export function StepVisual({ visual }: { visual: string }) {
  const map: Record<string, string> = {
    signup: "📝 Создайте аккаунт",
    import: "📂 Загрузите данные",
    automate: "🤖 Claude автоматизирует",
    grow: "📈 Масштабируйте бизнес",
  };

  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border bg-gradient-to-br from-muted/50 to-muted p-8 text-center">
      <div>
        <p className="text-4xl mb-4">
          {visual === "signup" && "📝"}
          {visual === "import" && "📂"}
          {visual === "automate" && "🤖"}
          {visual === "grow" && "📈"}
        </p>
        <p className="text-lg font-medium">{map[visual]}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Интерактивная иллюстрация шага
        </p>
      </div>
    </div>
  );
}
