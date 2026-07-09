"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
};

/**
 * Fade + slide-up reveal on scroll, with optional stagger delay.
 * Use inside a grid/list and pass `delay={index * 60}` for a stagger effect.
 */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const { ref, inView } = useInView(0.15);
  const Comp = as;

  return (
    <Comp
      ref={ref as never}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      )}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Comp>
  );
}
