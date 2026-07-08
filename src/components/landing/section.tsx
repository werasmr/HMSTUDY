"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

type SectionProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export function Section({ id, className, children }: SectionProps) {
  const { ref, inView } = useInView();

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "transition-all duration-700",
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </section>
  );
}
