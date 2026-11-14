"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { PROFILE } from "@/data/profile";
import { isLite } from "@/lib/motion";

let hasPlayedIntro = false;

export const INTRO_COVERED_EVENT = "portfolio:intro-covered";
export const INTRO_DONE_EVENT = "portfolio:intro-done";

const GLYPHS = "01<>/\\{}[]#$%&*+=?ABCDEFXZ";
const SCRAMBLE_WINDOW = 4;
const COLUMN_COUNT = 6;

// Boot log: one line per layer of the stack, flipped to "ok" as the counter passes its threshold
const BOOT_LOG = [
  { module: "win32.sendinput", status: "linked", at: 0.16 },
  { module: "webrtc.dtls-srtp", status: "handshake", at: 0.42 },
  { module: "inngest.dag", status: "scheduled", at: 0.68 },
  { module: "next@16 · react@19", status: "hydrated", at: 0.94 },
];

const NAME_WORDS = PROFILE.name.split(" ");

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState<boolean>(() => pathname === "/" && !hasPlayedIntro);
  const overlayRef = useRef<HTMLDivElement>(null);
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
    const stage = stageRef.current;
    const counterEl = counterRef.current;
    const progress = progressRef.current;
    if (!overlay || !stage || !counterEl || !progress) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let tl: gsap.core.Timeline | undefined;

    const ctx = gsap.context(() => {
      const chars = Array.from(overlay.querySelectorAll<HTMLSpanElement>("[data-intro-char]"));
      const logLines = Array.from(overlay.querySelectorAll<HTMLElement>("[data-intro-log]"));
      const papers = overlay.querySelectorAll("[data-intro-paper]");
      const inks = overlay.querySelectorAll("[data-intro-ink]");

      const counter = { value: 0 };
      const scramble = { p: 0 };
      let frame = 0;

      gsap.set(progress, { scaleX: 0 });
      gsap.set("[data-intro-corner]", { scale: 0, opacity: 0 });
      gsap.set("[data-intro-rise]", { yPercent: 115 });
      gsap.set(logLines, { opacity: 0, x: -8 });

      const renderScramble = () => {
        frame += 1;
        const reshuffle = frame % 2 === 0;
        const head = scramble.p * (chars.length + SCRAMBLE_WINDOW);
        chars.forEach((el, i) => {
          if (i < head - SCRAMBLE_WINDOW) {
            if (el.dataset.state !== "locked") el.dataset.state = "locked";
            return;
          }
          el.dataset.state = i < head ? "active" : "pending";
          if (reshuffle || !el.dataset.glyph) el.dataset.glyph = randomGlyph();
        });
      };

      const renderCounter = () => {
        const n = Math.round(counter.value);
        counterEl.textContent = String(n).padStart(3, "0");
        gsap.set(progress, { scaleX: counter.value / 100 });
        const ratio = counter.value / 100;
        logLines.forEach((line) => {
          const at = Number(line.dataset.at);
          if (ratio >= at && line.dataset.state !== "ok") {
            line.dataset.state = "ok";
          }
        });
      };

      renderScramble();

      tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          hasPlayedIntro = true;
          document.body.style.overflow = prevOverflow;
          setVisible(false);
        },
      });

      // Lite devices get the same sequence, just quicker
      if (isLite()) tl.timeScale(1.45);

      tl.to("[data-intro-corner]", { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(2)" }, 0)
        .to("[data-intro-rise]", { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "power4.out" }, 0.05)
        .to(scramble, { p: 1, duration: 1.15, ease: "power1.inOut", onUpdate: renderScramble }, 0.1)
        .to(
          counter,
          {
            keyframes: [
              { value: 21, duration: 0.32, ease: "power2.out" },
              { value: 47, duration: 0.38, ease: "power1.inOut" },
              { value: 74, duration: 0.3, ease: "power2.inOut" },
              { value: 92, duration: 0.28, ease: "power1.out" },
              { value: 100, duration: 0.2, ease: "power2.in" },
            ],
            onUpdate: renderCounter,
          },
          0.05
        );

      logLines.forEach((line) => {
        tl!.to(line, { opacity: 1, x: 0, duration: 0.35 }, 0.05 + Number(line.dataset.at) * 1.2);
      });

      // Exit: type falls up and out, frame collapses
      tl.addLabel("exit", "+=0.18")
        .to(chars, { yPercent: -120, duration: 0.42, stagger: 0.014, ease: "power3.in" }, "exit")
        .to("[data-intro-rise]", { yPercent: -115, duration: 0.36, stagger: 0.03, ease: "power3.in" }, "exit")
        .to(logLines, { opacity: 0, x: 8, duration: 0.25, stagger: 0.03, ease: "power2.in" }, "exit")
        .to("[data-intro-corner]", { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, "exit")
        .to(progress, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: "power3.inOut" }, "exit")
        .add(() => {
          gsap.set(stage, { display: "none" });
          window.queueMicrotask(() => window.dispatchEvent(new CustomEvent(INTRO_COVERED_EVENT)));
        })
        // Columns lift from the centre outward; the accent layer trails a beat behind
        // so every column drags a thin green edge across the page as it leaves.
        .addLabel("lift")
        .add(() => {
          window.queueMicrotask(() => window.dispatchEvent(new CustomEvent(INTRO_DONE_EVENT)));
        }, "lift")
        .to(
          papers,
          { yPercent: -100, duration: 0.78, ease: "power4.inOut", stagger: { each: 0.055, from: "center" } },
          "lift"
        )
        .to(
          inks,
          { yPercent: -100, duration: 0.78, ease: "power4.inOut", stagger: { each: 0.055, from: "center" } },
          "lift+=0.09"
        );
    }, overlay);

    // Impatient visitors can click or press a key to fast-forward
    const hurry = () => tl?.timeScale(3.2);
    overlay.addEventListener("pointerdown", hurry);
    window.addEventListener("keydown", hurry);

    return () => {
      overlay.removeEventListener("pointerdown", hurry);
      window.removeEventListener("keydown", hurry);
      document.body.style.overflow = prevOverflow;
      ctx.revert();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} className="intro-overlay no-print" aria-hidden="true">
      <div className="intro-cols">
        {Array.from({ length: COLUMN_COUNT }, (_, i) => (
          <div key={i} className="intro-col">
            <div data-intro-ink className="intro-col__ink" />
            <div data-intro-paper className="intro-col__paper" />
          </div>
        ))}
      </div>

      <div ref={stageRef} className="intro-stage">
        <span data-intro-corner className="intro-corner intro-corner--tl" />
        <span data-intro-corner className="intro-corner intro-corner--tr" />
        <span data-intro-corner className="intro-corner intro-corner--bl" />
        <span data-intro-corner className="intro-corner intro-corner--br" />

        <div className="intro-top measured">
          <span className="reveal-clip">
            <span data-intro-rise className="reveal-line">
              <span className="text-accent">RV</span>
              <span className="text-muted"> / portfolio.boot()</span>
            </span>
          </span>
          <span className="reveal-clip">
            <span data-intro-rise className="reveal-line text-muted">
              Mumbai · 19.07°N 72.87°E
            </span>
          </span>
        </div>

        <div className="intro-center">
          <p className="intro-name">
            {NAME_WORDS.map((word, wi) => (
              <span key={wi} className="intro-word">
                {word.split("").map((ch, ci) => (
                  <span
                    key={ci}
                    data-intro-char
                    className="intro-char"
                    data-state="pending"
                    // Deterministic seed glyph so SSR/hydration match and the line is never blank
                    data-glyph={GLYPHS[(wi * 11 + ci * 7) % GLYPHS.length]}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </p>
          <span className="reveal-clip">
            <span data-intro-rise className="reveal-line intro-role">
              {PROFILE.role}
            </span>
          </span>
        </div>

        <div className="intro-bottom">
          <ul className="intro-log measured">
            {BOOT_LOG.map((line) => (
              <li key={line.module} data-intro-log data-at={line.at} data-state="pending" className="intro-log__line">
                <span className="intro-log__badge" />
                <span className="intro-log__module">{line.module}</span>
                <span className="intro-log__status">{line.status}</span>
              </li>
            ))}
          </ul>

          <div className="reveal-clip">
            <span data-intro-rise className="reveal-line intro-counter">
              <span ref={counterRef}>000</span>
              <span className="intro-counter__unit">%</span>
            </span>
          </div>
        </div>

        <div className="intro-progress-track">
          <div ref={progressRef} className="intro-progress-fill" />
        </div>
      </div>
    </div>
  );
}
