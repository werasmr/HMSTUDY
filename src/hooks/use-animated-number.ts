"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Smoothly tweens a displayed number toward `value` whenever it changes.
 * Used for calculator results / stat counters so numbers don't just "jump".
 */
export function useAnimatedNumber(value: number, duration = 500) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number | null>(null);
  const from = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const startValue = from.current;
    const delta = value - startValue;

    if (delta === 0) return;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValue + delta * eased));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        from.current = value;
      }
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return display;
}
