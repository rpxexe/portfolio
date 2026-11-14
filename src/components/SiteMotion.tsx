"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { isLite } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, SplitText);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Regions that already choreograph their own entrance
const OWNED_MOTION = ".hero-section, [data-case-hero], [data-no-reveal]";

/**
 * Site-wide motion layer. Lives once in the root layout and re-scans the DOM on every
 * route change, so pages opt in with plain data attributes:
 *
 *   main h1 / main h2          → masked line-by-line rise (automatic)
 *   [data-reveal]              → fade-up, batched + staggered as they enter
 *   [data-reveal="image"]      → clip-path shutter wipe with inner zoom-out
 *   [data-reveal-stagger]      → direct children cascade in when the group enters
 *   [data-reveal="chars"]      → per-letter rise (used by the footer wordmark)
 */
export function SiteMotion() {
  const pathname = usePathname();
  const sweepRef = useRef<HTMLDivElement>(null);
  const isFirstRouteRef = useRef(true);

  useIsomorphicLayoutEffect(() => {
    const isFirst = isFirstRouteRef.current;
    isFirstRouteRef.current = false;

    const mm = gsap.matchMedia();
    const lite = isLite();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const main = document.getElementById("main");

        // 1. Route entrance: accent sweep across the top + content lift
        if (!isFirst && main) {
          const sweep = sweepRef.current;
          if (sweep) {
            gsap
              .timeline()
              .fromTo(sweep, { scaleX: 0, transformOrigin: "left center", opacity: 1 }, { scaleX: 1, duration: 0.45, ease: "power3.inOut" })
              .to(sweep, { scaleX: 0, transformOrigin: "right center", duration: 0.45, ease: "power3.inOut" });
          }
          gsap.fromTo(
            main,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "expo.out",
              clearProps: "transform,opacity",
              onComplete: () => ScrollTrigger.refresh(),
            }
          );
        }

        // 2. Headings: masked line rise
        const headings = gsap.utils
          .toArray<HTMLElement>("main h1, main h2")
          .filter((el) => !el.closest(OWNED_MOTION) && !el.querySelector("a, button"));

        headings.forEach((heading) => {
          const isPageTitle = heading.tagName === "H1";
          // Lite: one transform per heading instead of per-line splitting + masks
          if (lite) {
            gsap.from(heading, {
              y: 24,
              opacity: 0,
              duration: 0.6,
              ease: "power3.out",
              clearProps: "transform,opacity",
              scrollTrigger: isPageTitle ? undefined : { trigger: heading, start: "top 90%", once: true },
            });
            return;
          }
          SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                rotate: 2.5,
                transformOrigin: "0% 100%",
                duration: 1,
                stagger: 0.09,
                ease: "expo.out",
                delay: isPageTitle ? 0.15 : 0,
                scrollTrigger: isPageTitle ? undefined : { trigger: heading, start: "top 88%", once: true },
              }),
          });
        });

        // 3. Generic fade-up blocks, batched so neighbours cascade
        const blocks = gsap.utils
          .toArray<HTMLElement>("[data-reveal]:not([data-reveal='image']):not([data-reveal='chars'])")
          .filter((el) => !el.closest(OWNED_MOTION));
        if (blocks.length) {
          gsap.set(blocks, { y: lite ? 18 : 36, opacity: 0 });
          ScrollTrigger.batch(blocks, {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                y: 0,
                opacity: 1,
                duration: lite ? 0.55 : 0.9,
                stagger: lite ? 0.05 : 0.08,
                ease: "expo.out",
                clearProps: "transform,opacity",
              }),
          });
        }

        // 4. Staggered groups
        gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((group) => {
          const kids = Array.from(group.children) as HTMLElement[];
          if (!kids.length) return;
          gsap.fromTo(
            kids,
            lite ? { y: 14, opacity: 0, scale: 1 } : { y: 28, opacity: 0, scale: 0.97 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              stagger: 0.07,
              ease: "expo.out",
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: group, start: "top 88%", once: true },
            }
          );
        });

        // 5. Image shutters
        gsap.utils.toArray<HTMLElement>("[data-reveal='image']").forEach((frame) => {
          const media = frame.querySelector("img, video");
          const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 88%", once: true } });
          tl.fromTo(
            frame,
            { clipPath: "inset(0% 0% 100% 0% round 12px)" },
            { clipPath: "inset(0% 0% 0% 0% round 12px)", duration: 1.1, ease: "expo.inOut", clearProps: "clipPath" }
          );
          if (media && !lite) {
            tl.fromTo(media, { scale: 1.25 }, { scale: 1, duration: 1.4, ease: "expo.out", clearProps: "transform" }, 0.1);
          }
        });

        // 6. Per-letter wordmarks
        gsap.utils.toArray<HTMLElement>("[data-reveal='chars']").forEach((word) => {
          if (lite) {
            gsap.from(word, {
              y: 30,
              opacity: 0,
              duration: 0.8,
              ease: "expo.out",
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: word, start: "top 95%", once: true },
            });
            return;
          }
          SplitText.create(word, {
            type: "chars",
            charsClass: "split-char",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 60,
                rotationX: -95,
                opacity: 0,
                transformOrigin: "50% 100% -20px",
                duration: 1.1,
                stagger: { each: 0.04, from: "start" },
                ease: "expo.out",
                clearProps: "transform,opacity",
                scrollTrigger: { trigger: word, start: "top 95%", once: true },
              }),
          });
        });
      });

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [pathname]);

  // Pause every looping CSS/SMIL animation inside [data-anim-zone] while it is off-screen
  useEffect(() => {
    const zones = Array.from(document.querySelectorAll<HTMLElement>("[data-anim-zone]"));
    if (!zones.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          el.dataset.paused = e.isIntersecting ? "false" : "true";
          el.querySelectorAll("svg").forEach((svg) => {
            if (e.isIntersecting) svg.unpauseAnimations?.();
            else svg.pauseAnimations?.();
          });
        });
      },
      { rootMargin: "120px 0px" }
    );
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, [pathname]);

  return <div ref={sweepRef} className="route-sweep no-print" aria-hidden="true" />;
}
