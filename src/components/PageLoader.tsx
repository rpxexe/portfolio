"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { PROFILE } from "@/data/profile";

let hasPlayedIntro = false;

export const INTRO_COVERED_EVENT = "portfolio:intro-covered";
export const INTRO_DONE_EVENT = "portfolio:intro-done";

export function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState<boolean>(() => pathname === "/" && !hasPlayedIntro);
  const overlayRef = useRef<HTMLDivElement>(null);
  const topShutterRef = useRef<HTMLDivElement>(null);
  const botShutterRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      hasPlayedIntro = true;
      window.dispatchEvent(new CustomEvent(INTRO_DONE_EVENT));
      const frame = window.requestAnimationFrame(() => setVisible(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const overlay = overlayRef.current;
    const topShutter = topShutterRef.current;
    const botShutter = botShutterRef.current;
    const stage = stageRef.current;
    const counterEl = counterRef.current;
    const progress = progressRef.current;
    if (!overlay || !topShutter || !botShutter || !stage || !counterEl || !progress) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const counter = { value: 0 };

      gsap.set(progress, { scaleX: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          hasPlayedIntro = true;
          document.body.style.overflow = prevOverflow;
          setVisible(false);
        },
      });

      const updateCounterText = () => {
        const n = Math.round(counter.value);
        counterEl.textContent = String(n).padStart(2, "0");
      };

      tl.to(counter, {
        value: 100,
        duration: 0.88,
        ease: "power2.inOut",
        onUpdate: updateCounterText,
      })
        .to(
          progress,
          {
            scaleX: 1,
            duration: 0.88,
            ease: "power2.inOut",
          },
          0
        )
        .to(
          "[data-intro-exit]",
          {
            yPercent: -115,
            duration: 0.3,
            stagger: 0.03,
            ease: "power3.inOut",
          },
          "+=0.05"
        )
        .add(() => {
          gsap.set(stage, { display: "none" });
          window.queueMicrotask(() => window.dispatchEvent(new CustomEvent(INTRO_COVERED_EVENT)));
        })
        // Newton's 3rd law symmetric aperture parting — zero extra curtain flash
        .to(topShutter, {
          yPercent: -102,
          duration: 0.72,
          ease: "power4.inOut",
          onStart: () => {
            window.queueMicrotask(() => window.dispatchEvent(new CustomEvent(INTRO_DONE_EVENT)));
          },
        })
        .to(
          botShutter,
          {
            yPercent: 102,
            duration: 0.72,
            ease: "power4.inOut",
          },
          "<"
        );
    }, overlay);

    return () => {
      document.body.style.overflow = prevOverflow;
      ctx.revert();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} className="intro-overlay no-print" aria-hidden="true">
      <div ref={topShutterRef} className="intro-shutter intro-shutter--top" />
      <div ref={botShutterRef} className="intro-shutter intro-shutter--bot" />

      <div ref={stageRef} className="intro-stage">
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="reveal-clip">
            <span data-intro-exit className="reveal-line">
              {PROFILE.name}
            </span>
          </span>
          <span className="reveal-clip">
            <span data-intro-exit className="reveal-line measured text-cool">
              Mumbai, India
            </span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 my-auto">
          <div className="flex flex-col gap-2">
            <span className="reveal-clip">
              <span data-intro-exit className="reveal-line text-3xl sm:text-5xl font-medium">
                Systems &amp; Full-Stack
              </span>
            </span>
            <span className="reveal-clip">
              <span data-intro-exit className="reveal-line text-4xl sm:text-6xl serif-flourish text-cool">
                Engineering Portfolio
              </span>
            </span>
          </div>

          <div className="reveal-clip">
            <span ref={counterRef} data-intro-exit className="reveal-line intro-counter">
              00
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="intro-progress-track">
            <div ref={progressRef} className="intro-progress-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}
