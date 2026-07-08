"use client";

import { useEffect, useState } from "react";
import { AI_SCENARIOS } from "@/components/landing/data";
import { Section } from "@/components/landing/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function useTypewriter(text: string, active: boolean, onComplete?: () => void) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!active) {
      setValue("");
      return;
    }

    let index = 0;
    setValue("");
    const timer = setInterval(() => {
      index += 1;
      setValue(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 20);

    return () => clearInterval(timer);
  }, [text, active, onComplete]);

  return value;
}

export function AiDemoSection() {
  const [scenarioId, setScenarioId] = useState(AI_SCENARIOS[0].id);
  const [step, setStep] = useState<"idle" | "user" | "assistant" | "done">("idle");

  const scenario = AI_SCENARIOS.find((item) => item.id === scenarioId) ?? AI_SCENARIOS[0];
  const userText = useTypewriter(scenario.user, step === "user", () => setStep("assistant"));
  const assistantText = useTypewriter(scenario.assistant, step === "assistant", () => setStep("done"));

  function play() {
    setStep("user");
  }

  useEffect(() => {
    setStep("idle");
  }, [scenarioId]);

  return (
    <Section className="bg-muted/30 px-4 py-20 md:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Живая демонстрация AI-ассистента</h2>
          <p className="mt-3 text-muted-foreground">
            Демо-диалоги без реального API — посмотрите, как Proto отвечает на бизнес-вопросы
          </p>
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {AI_SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScenarioId(item.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                scenarioId === item.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Proto AI</CardTitle>
            <Button variant="outline" size="sm" onClick={play} disabled={step === "user" || step === "assistant"}>
              {step === "user" || step === "assistant" ? "Воспроизведение..." : "Показать пример"}
            </Button>
          </CardHeader>
          <CardContent className="min-h-[240px] space-y-4">
            {step === "idle" && (
              <p className="text-sm text-muted-foreground">
                Нажмите «Показать пример», чтобы увидеть диалог
              </p>
            )}

            {(step === "user" || step === "assistant" || step === "done") && (
              <div className="max-w-[90%] rounded-lg bg-muted px-3 py-2 text-sm">
                {step === "done" ? scenario.user : userText}
                {step === "user" && <span className="animate-pulse">|</span>}
              </div>
            )}

            {(step === "assistant" || step === "done") && (
              <div className="ml-auto max-w-[90%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                {step === "done" ? scenario.assistant : assistantText}
                {step === "assistant" && <span className="animate-pulse">|</span>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
