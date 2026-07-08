"use client";

import { useState } from "react";
import { FEATURES } from "@/components/landing/data";
import { FeatureMiniPreview } from "@/components/landing/dashboard-mockup";
import { Section } from "@/components/landing/section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  const [selected, setSelected] = useState<(typeof FEATURES)[number] | null>(null);

  return (
    <Section id="features" className="px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Возможности</h2>
          <p className="mt-3 text-muted-foreground">
            7 модулей для управления бизнесом — кликните на карточку для подробностей
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => setSelected(feature)}
              className="text-left"
            >
              <Card
                className={cn(
                  "h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  "cursor-pointer",
                )}
              >
                <CardHeader>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FeatureMiniPreview featureId={feature.id} />
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>{selected.details}</DialogDescription>
              </DialogHeader>
              <FeatureMiniPreview featureId={selected.id} />
              <div className="flex flex-wrap gap-2">
                {selected.highlights.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}
