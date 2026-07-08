"use client";

import { useState } from "react";
import { STEPS } from "@/components/landing/data";
import { StepVisual } from "@/components/landing/dashboard-mockup";
import { Section } from "@/components/landing/section";
import { cn } from "@/lib/utils";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];

  return (
    <Section id="how-it-works" className="px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Как это работает</h2>
          <p className="mt-3 text-muted-foreground">4 шага от регистрации до роста бизнеса</p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {STEPS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveStep(index)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-all",
                  activeStep === index
                    ? "border-primary bg-primary/5 shadow-md"
                    : "hover:border-muted-foreground/30 hover:bg-muted/40",
                )}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                      activeStep === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </button>
            ))}
          </div>

          <div className="transition-all duration-500">
            <StepVisual visual={step.visual} />
          </div>
        </div>
      </div>
    </Section>
  );
}
