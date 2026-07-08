"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AI_SCENARIOS } from "@/components/landing/data";
import { Section } from "@/components/landing/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

function useTypewriter(text: string, active: boolean, onComplete?: () => void) {
  const [value, setValue] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
        onCompleteRef.current?.();
      }
    }, 20);

    return () => clearInterval(timer);
  }, [text, active]);

  return value;
}

export function AiDemoSection() {
  const { ref, inView } = useInView(0.3);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState<"idle" | "user" | "assistant" | "done">("idle");
  const [autoPlay, setAutoPlay] = useState(true);
  const hasAutoStarted = useRef(false);

  const scenario = AI_SCENARIOS[scenarioIndex];

  const handleUserComplete = useCallback(() => setStep("assistant"), []);
  const handleAssistantComplete = useCallback(() => setStep("done"), []);

  const userText = useTypewriter(scenario.user, step === "user", handleUserComplete);
  const assistantText = useTypewriter(
    scenario.assistant,
    step === "assistant",
    handleAssistantComplete,
  );

  function play() {
    setStep("user");
  }

  function selectScenario(index: number) {
    setScenarioIndex(index);
    setStep("idle");
    hasAutoStarted.current = false;
  }

  useEffect(() => {
    if (!inView || !autoPlay || hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    const timer = setTimeout(() => setStep("user"), 600);
    return () => clearTimeout(timer);
  }, [inView, autoPlay]);

  useEffect(() => {
    if (step !== "done" || !autoPlay) return;

    const timer = setTimeout(() => {
      setScenarioIndex((current) => (current + 1) % AI_SCENARIOS.length);
      setStep("user");
    }, 2500);

    return () => clearTimeout(timer);
  }, [step, autoPlay]);

  return (
    <Section className="bg-muted/30 px-4 py-20 md:px-6">
      <div ref={ref} className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Живая демонстрация AI-ассистента</h2>
          <p className="mt-3 text-muted-foreground">
            Демо-диалоги без реального API — посмотрите, как Proto отвечает на бизнес-вопросы
          </p>
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {AI_SCENARIOS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectScenario(index)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                scenarioIndex === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Proto AI</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoPlay((value) => !value)}
                className="text-xs"
              >
                {autoPlay ? "Авто: вкл" : "Авто: выкл"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={play}
                disabled={step === "user" || step === "assistant"}
              >
                {step === "user" || step === "assistant" ? "Воспроизведение..." : "Показать пример"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="min-h-[240px] space-y-4">
            {step === "idle" && (
              <p className="text-sm text-muted-foreground">
                {autoPlay
                  ? "Диалог начнётся автоматически при прокрутке к секции"
                  : "Нажмите «Показать пример», чтобы увидеть диалог"}
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
