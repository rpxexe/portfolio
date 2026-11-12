"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgressSpine() {
  const fillRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 60rem)", () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              start: 0,
              end: () => ScrollTrigger.maxScroll(window) || document.documentElement.scrollHeight - window.innerHeight,
              scrub: 0.2,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      return () => ctx.revert();
    });

    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      window.clearTimeout(timer);
      mm.revert();
    };
  }, [pathname]);

  return (
    <div className="scroll-spine no-print" aria-hidden="true">
      <div ref={fillRef} className="scroll-spine__fill" />
    </div>
  );
}
