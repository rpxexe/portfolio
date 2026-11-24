"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, FileText, Layers } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";
import { SystemGraph } from "@/components/SystemGraph";
import { INTRO_COVERED_EVENT, INTRO_DONE_EVENT } from "@/components/PageLoader";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

// Order matches the SystemGraph nodes: BrainFlow, Arcix, Arcwire, AssetsVista
const HERO_LOOP_PHRASES = ["AI pipelines", "remote desktops", "encrypted messengers", "SaaS platforms"];

const PROOF = [
  { value: PROJECTS.length, decimals: 0, prefix: "", suffix: "", label: "systems shipped" },
  { value: 1.5, decimals: 1, prefix: "", suffix: "y", label: "in production" },
  { value: 8.7, decimals: 2, prefix: "", suffix: "", label: "CGPI / 10" },
  { value: 1, decimals: 0, prefix: "#", suffix: "", label: "college coding" },
];
const PHRASE_HOLD = 2.4;

const pad2 = (n: number) => String(n).padStart(2, "0");

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const copyColRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phraseRef = useRef<HTMLSpanElement>(null);
  const timerFillRef = useRef<HTMLSpanElement>(null);
  const rollInRef = useRef<(() => void) | null>(null);
  const pendingRollInRef = useRef(false);

  const [phraseIdx, setPhraseIdx] = useState(0);

  // New phrase just rendered: roll its letters in, then restart the timer rule.
  useLayoutEffect(() => {
    if (!pendingRollInRef.current) return;
    pendingRollInRef.current = false;
    rollInRef.current?.();
  }, [phraseIdx]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let active = true;
      const timerFill = timerFillRef.current;

      const getReveals = () => root.querySelectorAll("[data-hero-reveal]");
      const getItems = () => root.querySelectorAll("[data-hero-item]");
      const getChars = () => phraseRef.current?.querySelectorAll("[data-hero-char]") ?? [];

      const prepareHeroReveal = () => {
        if (!active) return;
        const reveals = getReveals();
        const items = getItems();
        if (reveals.length) gsap.set(reveals, { yPercent: 112 });
        if (items.length) gsap.set(items, { y: 18, opacity: 0 });
      };

      // Phrase loop: timer rule fills → letters roll out → state swaps → letters roll in → repeat
      const runTimer = () => {
        if (!active || !timerFill) return;
        gsap.fromTo(
          timerFill,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: PHRASE_HOLD, ease: "none", onComplete: rollOut }
        );
      };

      const rollOut = () => {
        if (!active) return;
        if (timerFill) gsap.to(timerFill, { scaleX: 0, transformOrigin: "right center", duration: 0.35, ease: "power3.in" });
        gsap.to(getChars(), {
          yPercent: -110,
          rotate: -6,
          opacity: 0,
          duration: 0.34,
          stagger: 0.012,
          ease: "power3.in",
          onComplete: () => {
            if (!active) return;
            pendingRollInRef.current = true;
            setPhraseIdx((i) => (i + 1) % HERO_LOOP_PHRASES.length);
          },
        });
      };

      rollInRef.current = () => {
        if (!active) return;
        gsap.fromTo(
          getChars(),
          { yPercent: 110, rotate: 8, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.62,
            stagger: 0.022,
            ease: "power4.out",
            onComplete: runTimer,
          }
        );
      };

      const playHeroReveal = () => {
        if (!active) return;
        const reveals = getReveals();
        const items = getItems();

        if (reveals.length) {
          gsap.fromTo(
            reveals,
            { yPercent: 112 },
            {
              yPercent: 0,
              duration: 0.85,
              stagger: 0.09,
              ease: "power4.out",
              clearProps: "transform",
              onComplete: runTimer,
            }
          );
        } else {
          runTimer();
        }

        root.querySelectorAll<HTMLElement>("[data-count]").forEach((el, i) => {
          const target = Number(el.dataset.count);
          const decimals = Number(el.dataset.decimals ?? 0);
          const counter = { v: 0 };
          gsap.to(counter, {
            v: target,
            duration: 1.6,
            delay: 0.5 + i * 0.12,
            ease: "expo.out",
            onUpdate: () => {
              el.textContent = `${el.dataset.prefix ?? ""}${counter.v.toFixed(decimals)}${el.dataset.suffix ?? ""}`;
            },
          });
        });

        if (items.length) {
          gsap.fromTo(
            items,
            { y: 18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.07,
              delay: 0.15,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }
          );
        }
      };

      const overlayExists = Boolean(document.querySelector(".intro-overlay"));
      if (overlayExists) {
        window.addEventListener(INTRO_COVERED_EVENT, prepareHeroReveal, { once: true });
        window.addEventListener(INTRO_DONE_EVENT, playHeroReveal, { once: true });
      } else {
        playHeroReveal();
      }

      return () => {
        active = false;
        rollInRef.current = null;
        pendingRollInRef.current = false;
        window.removeEventListener(INTRO_COVERED_EVENT, prepareHeroReveal);
        window.removeEventListener(INTRO_DONE_EVENT, playHeroReveal);
        if (timerFill) gsap.killTweensOf(timerFill);
        gsap.killTweensOf(getChars());
      };
    });

    // Multi-plane parallax on large screens
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 60rem)", () => {
      gsap.fromTo(
        stage,
        { y: 0, scale: 1, rotation: 0 },
        {
          y: -76,
          scale: 0.95,
          rotation: -2,
          ease: "none",
          immediateRender: false,
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.4 },
        }
      );

      if (copyColRef.current) {
        gsap.fromTo(
          copyColRef.current,
          { y: 0 },
          {
            y: -22,
            ease: "none",
            immediateRender: false,
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.4 },
          }
        );
      }
    });

    return () => mm.revert();
  }, []);

  const phrase = HERO_LOOP_PHRASES[phraseIdx];

  return (
    <section ref={rootRef} className="hero-section" data-src="src/components/Hero.tsx" aria-labelledby="hero-heading" data-anim-zone>
      <div className="container stage-grid relative z-10">
        <div ref={copyColRef} className="copy-col">
          <div className="hero-eyebrow measured" data-hero-item>
            <span className="hero-eyebrow__dot" aria-hidden="true" />
            <span>Available for full-time roles</span>
            <span className="hero-eyebrow__sep" aria-hidden="true">/</span>
            <span className="text-muted">2026</span>
          </div>

          <div className="display-stack">
            <h1 id="hero-heading">
              <span className="reveal-clip">
                <span data-hero-reveal className="reveal-line">
                  Code that <span className="hero-mark">ships</span>
                </span>
              </span>
              <span className="serif-line">
                <span className="reveal-clip">
                  <span data-hero-reveal className="reveal-line">
                    <span className="hero-to">as </span>
                    <span ref={phraseRef} className="hero-phrase" aria-hidden="true">
                      {phrase.split(" ").map((word, wi) => (
                        <span key={`${phraseIdx}-${wi}`}>
                          {wi > 0 ? " " : null}
                          <span className="hero-word">
                            {word.split("").map((ch, ci) => (
                              <span key={ci} data-hero-char className="hero-char">
                                {ch}
                              </span>
                            ))}
                          </span>
                        </span>
                      ))}
                    </span>
                    <span className="visually-hidden">{HERO_LOOP_PHRASES.join(", ")}</span>
                  </span>
                </span>
              </span>
            </h1>

            <div className="hero-ticker measured" data-hero-item aria-hidden="true">
              <span className="text-accent">{pad2(phraseIdx + 1)}</span>
              <span className="hero-ticker__track">
                <span ref={timerFillRef} className="hero-ticker__fill" />
              </span>
              <span className="text-muted">{pad2(HERO_LOOP_PHRASES.length)}</span>
            </div>
          </div>

          <p className="lead text-ink-2">
            <span className="reveal-clip">
              <span data-hero-reveal className="reveal-line">
                {PROFILE.subhead}
              </span>
            </span>
          </p>

          <div className="action-row" data-hero-item>
            <Magnetic>
              <Link
                href="/work"
                className="btn btn--primary"
              >
                <Layers size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>Explore work</span>
              </Link>
            </Magnetic>
            <Magnetic strength={3}>
              <Link
                href="/resume"
                className="bracket-btn"
              >
                <FileText size={14} strokeWidth={1.75} aria-hidden="true" />
                <span>Resume</span>
              </Link>
            </Magnetic>
          </div>

          <dl className="hero-proof" data-hero-item>
            {PROOF.map((item) => (
              <div key={item.label} className="hero-proof__item">
                <dt className="hero-proof__label">{item.label}</dt>
                <dd
                  className="hero-proof__value"
                  data-count={item.value}
                  data-decimals={item.decimals}
                  data-prefix={item.prefix}
                  data-suffix={item.suffix}
                >
                  {`${item.prefix}${item.value.toFixed(item.decimals)}${item.suffix}`}
                </dd>
              </div>
            ))}
          </dl>

          <div className="hero-links" data-hero-item>
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="hero-social">
              GitHub
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
            </a>
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="hero-social">
              LinkedIn
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
            </a>
            <a href={`mailto:${PROFILE.email}`} className="hero-social">
              Email
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div ref={stageRef} className="stage-col">
          <div className="hero-stage" data-hero-item>
            <span className="hero-stage__corner hero-stage__corner--tl" aria-hidden="true" />
            <span className="hero-stage__corner hero-stage__corner--tr" aria-hidden="true" />
            <span className="hero-stage__corner hero-stage__corner--bl" aria-hidden="true" />
            <span className="hero-stage__corner hero-stage__corner--br" aria-hidden="true" />

            <div className="hero-stage__bar measured" aria-hidden="true">
              <span className="hero-stage__label">
                <span className="hero-eyebrow__dot" />
                pipeline.dag
              </span>
              <span className="hero-stage__bars">
                <i /><i /><i /><i /><i />
              </span>
              <span className="text-muted hover-hint">hover a node</span>
              <span className="text-muted touch-hint">tap a node</span>
            </div>

            <div className="hero-stage__viewport">
              <span className="hero-stage__grid" aria-hidden="true" />
              <span className="hero-stage__scan" aria-hidden="true" />
              <SystemGraph activeIndex={phraseIdx} />
            </div>
          </div>
        </div>
      </div>

      <div className="container hero-scroll" aria-hidden="true">
        <span className="hero-scroll__cue measured" data-hero-item>
          <span className="hero-scroll__line" />
          Scroll
        </span>
      </div>
    </section>
  );
}
