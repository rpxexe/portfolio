"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileText, Layers } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";
import { MascotCompanion, type MascotMood } from "@/components/MascotCompanion";
import { INTRO_COVERED_EVENT, INTRO_DONE_EVENT } from "@/components/PageLoader";
import { PROFILE } from "@/data/profile";

gsap.registerPlugin(ScrollTrigger);

const HERO_LOOP_PHRASES = [
  "to AI orchestration",
  "to realtime WebRTC",
  "to zero-cloud crypto",
  "to full-stack SaaS",
];

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const copyColRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const loopWordRef = useRef<HTMLSpanElement>(null);
  const primaryTitleRef = useRef<HTMLSpanElement>(null);

  const [istTime, setIstTime] = useState("23:55 IST");
  const [hoverMood, setHoverMood] = useState<MascotMood | null>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
        setIstTime(`${formatted} IST`);
      } catch {
        setIstTime("IST +05:30");
      }
    };
    updateClock();
    const id = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let active = true;
      let firstTimeout: number | undefined;
      let loopTimer: number | undefined;
      let rafId: number | undefined;

      const getReveals = () => root.querySelectorAll("[data-hero-reveal]");
      const getItems = () => root.querySelectorAll("[data-hero-item]");

      const prepareHeroReveal = () => {
        if (!active) return;
        const reveals = getReveals();
        const items = getItems();
        if (reveals.length) gsap.set(reveals, { yPercent: 112 });
        if (items.length) gsap.set(items, { y: 16, opacity: 0 });
      };

      const startHeroLoops = () => {
        if (!active) return;

        // Subtle infinite breath float on headline line 1
        if (primaryTitleRef.current) {
          gsap.to(primaryTitleRef.current, {
            y: 3,
            opacity: 0.88,
            duration: 2.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }

        // Infinite loop slot-roll morphing Hero serif line 2 across Rishabh's domains
        const cycleNext = () => {
          const word = loopWordRef.current;
          if (!active || !word) return;
          gsap.to(word, {
            yPercent: -105,
            opacity: 0,
            duration: 0.36,
            ease: "power3.in",
            onComplete: () => {
              if (!active) return;
              gsap.set(word, { yPercent: 105, opacity: 0 });
              setPhraseIdx((i) => (i + 1) % HERO_LOOP_PHRASES.length);
              rafId = window.requestAnimationFrame(() => {
                if (!active) return;
                gsap.to(word, {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.48,
                  ease: "power4.out",
                  clearProps: "opacity",
                });
              });
            },
          });
        };

        firstTimeout = window.setTimeout(() => {
          cycleNext();
          loopTimer = window.setInterval(cycleNext, 2400);
        }, 1100);
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
              duration: 0.78,
              stagger: 0.09,
              ease: "power4.out",
              clearProps: "transform",
              onComplete: startHeroLoops,
            }
          );
        } else {
          startHeroLoops();
        }

        if (items.length) {
          gsap.fromTo(
            items,
            { y: 16, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.06,
              delay: 0.12,
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
        window.removeEventListener(INTRO_COVERED_EVENT, prepareHeroReveal);
        window.removeEventListener(INTRO_DONE_EVENT, playHeroReveal);
        if (firstTimeout) window.clearTimeout(firstTimeout);
        if (loopTimer) window.clearInterval(loopTimer);
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    });

    // Multi-plane parallax depth across headline copy & mascot stage
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
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.4,
          },
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
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.4,
            },
          }
        );
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} className="hero-section" aria-labelledby="hero-heading">
      <div className="container stage-grid relative z-10">
        <div ref={copyColRef} className="copy-col">
          <div className="display-stack">
            <h1 id="hero-heading">
              <span className="reveal-clip">
                <span ref={primaryTitleRef} data-hero-reveal className="reveal-line">
                  Systems from Win32
                </span>
              </span>
              <span className="serif-line">
                <span className="reveal-clip">
                  <span ref={loopWordRef} data-hero-reveal className="reveal-line">
                    {HERO_LOOP_PHRASES[phraseIdx]}
                  </span>
                </span>
              </span>
            </h1>
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
                onPointerEnter={() => setHoverMood("love")}
                onPointerLeave={() => setHoverMood(null)}
              >
                <Layers size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>Explore work</span>
              </Link>
            </Magnetic>
            <Magnetic strength={3}>
              <Link
                href="/resume"
                className="bracket-btn"
                onPointerEnter={() => setHoverMood("focused")}
                onPointerLeave={() => setHoverMood(null)}
              >
                <FileText size={14} strokeWidth={1.75} aria-hidden="true" />
                <span>Resume</span>
              </Link>
            </Magnetic>
          </div>

          <div className="meta-strip text-sm" data-hero-item>
            <span className="measured text-accent">{istTime}</span>
            <span className="measured text-muted">Mumbai, 2026</span>
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="text-link">
              GitHub
            </a>
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
              LinkedIn
            </a>
          </div>
        </div>

        <div ref={stageRef} className="stage-col">
          <div data-hero-item>
            <MascotCompanion externalMood={hoverMood} />
          </div>
        </div>
      </div>
    </section>
  );
}
