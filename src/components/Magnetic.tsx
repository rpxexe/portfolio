"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export function Magnetic({
  children,
  strength = 4,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.28, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.28, ease: "power3.out" });

        const onMove = (e: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          xTo(Math.max(-1, Math.min(1, relX)) * strength);
          yTo(Math.max(-1, Math.min(1, relY)) * strength);
        };

        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);

        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          gsap.set(el, { clearProps: "x,y" });
        };
      }
    );

    return () => mm.revert();
  }, [strength]);

  return (
    <span ref={wrapRef} className="inline-flex">
      {children}
    </span>
  );
}

