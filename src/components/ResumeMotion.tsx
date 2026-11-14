"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type TocItem = { id: string; label: string };

/**
 * Resume layout shell: sticky table of contents with scroll-spy + an SVG progress
 * rail, and the scroll-driven timeline rail that draws as experience scrolls past.
 */
export function ResumeShell({ toc, children }: { toc: TocItem[]; children: ReactNode }) {
  const [active, setActive] = useState(toc[0]?.id ?? "");
  const contentRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Scroll-spy: whichever section crosses the upper third becomes active
    const sections = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => io.observe(s));

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // TOC progress rail
        if (railRef.current) {
          gsap.fromTo(
            railRef.current,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: { trigger: content, start: "top 30%", end: "bottom 70%", scrub: 0.3 },
            }
          );
        }

        // Experience timeline: rail fills, nodes light up as they pass
        const fill = content.querySelector<HTMLElement>(".cv-timeline__fill");
        const timeline = content.querySelector<HTMLElement>(".cv-timeline");
        if (fill && timeline) {
          gsap.fromTo(
            fill,
            { scaleY: 0 },
            { scaleY: 1, ease: "none", scrollTrigger: { trigger: timeline, start: "top 65%", end: "bottom 55%", scrub: 0.4 } }
          );
        }
        gsap.utils.toArray<HTMLElement>(".cv-timeline__item").forEach((item) => {
          ScrollTrigger.create({ trigger: item, start: "top 62%", toggleClass: { targets: item, className: "is-on" } });
          gsap.from(item.querySelectorAll("li"), {
            x: -16,
            opacity: 0,
            duration: 0.6,
            stagger: 0.07,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 75%", once: true },
          });
        });

        // Skill chips cascade per group
        gsap.utils.toArray<HTMLElement>(".cv-skill").forEach((group) => {
          gsap.from(group.querySelectorAll(".chip"), {
            y: 14,
            opacity: 0,
            scale: 0.9,
            duration: 0.5,
            stagger: 0.03,
            ease: "back.out(2)",
            scrollTrigger: { trigger: group, start: "top 85%", once: true },
          });
        });
      }, content);
      return () => ctx.revert();
    });

    return () => {
      io.disconnect();
      mm.revert();
    };
  }, [toc]);

  const activeIndex = Math.max(0, toc.findIndex((t) => t.id === active));

  return (
    <div className="resume__layout">
      <aside className="resume__toc no-print" aria-label="Resume sections">
        <p className="measured text-muted resume__toc-label">contents</p>
        <div className="resume__toc-body">
          <svg className="resume__toc-rail" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="1" y1="0" x2="1" y2="100" className="resume__toc-track" />
            <line ref={railRef} x1="1" y1="0" x2="1" y2="100" pathLength={1} className="resume__toc-progress" />
          </svg>
          <ol className="resume__toc-list" style={{ "--active": activeIndex } as CSSProperties}>
            <span className="resume__toc-marker" aria-hidden="true" />
            {toc.map((t, i) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="resume__toc-link" data-active={t.id === active ? "true" : "false"}>
                  <span className="measured">{String(i + 1).padStart(2, "0")}</span>
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </aside>
      <div ref={contentRef} className="resume__content">
        {children}
      </div>
    </div>
  );
}
