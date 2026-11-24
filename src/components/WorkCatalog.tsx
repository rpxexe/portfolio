"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Code2 } from "lucide-react";
import { ArchDiagram } from "@/components/ArchDiagram";
import { PROJECTS, type ProjectTier } from "@/data/projects";

gsap.registerPlugin(Flip, ScrollTrigger);

const FILTERS: { id: "all" | ProjectTier; label: string }[] = [
  { id: "all", label: "All systems" },
  { id: "systems", label: "Systems & Desktop" },
  { id: "ai", label: "AI & Automation" },
  { id: "fullstack", label: "Full-Stack SaaS" },
  { id: "web", label: "Mobile & Web" },
];

const countFor = (id: "all" | ProjectTier) => (id === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.tier === id).length);

/** Cursor-tracking glow: writes pointer coords into CSS vars the border/sheen read. */
function trackPointer(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export function WorkCatalog() {
  const [tier, setTier] = useState<"all" | ProjectTier>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const visibleProjects = tier === "all" ? PROJECTS : PROJECTS.filter((p) => p.tier === tier);

  function handleFilterSelect(nextTier: "all" | ProjectTier) {
    if (nextTier === tier) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && containerRef.current) {
      flipStateRef.current = Flip.getState(containerRef.current.querySelectorAll("[data-catalog-card]"));
    }
    setTier(nextTier);
  }

  // Sliding pill behind the active filter
  const placePill = useCallback((instant = false) => {
    const bar = filterBarRef.current;
    const pill = pillRef.current;
    const activeBtn = bar?.querySelector<HTMLElement>("[aria-selected='true']");
    if (!pill || !activeBtn) return;
    gsap.to(pill, {
      x: activeBtn.offsetLeft,
      y: activeBtn.offsetTop,
      width: activeBtn.offsetWidth,
      height: activeBtn.offsetHeight,
      duration: instant ? 0 : 0.6,
      ease: "elastic.out(1, 0.8)",
    });
  }, []);

  useLayoutEffect(() => {
    placePill(true);
    const onResize = () => placePill(true);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => placePill(true));
    return () => window.removeEventListener("resize", onResize);
  }, [placePill]);

  useLayoutEffect(() => {
    placePill();
    const state = flipStateRef.current;
    flipStateRef.current = null;
    if (!state || !containerRef.current) return;

    const ctx = gsap.context(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: "expo.inOut",
        stagger: 0.035,
        absolute: true,
        scale: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "expo.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.3, ease: "power2.in" }),
        clearProps: "all",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [tier, placePill]);

  // First paint: cards rise in as they scroll into view; media zooms out of a clip
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-catalog-card]");
        gsap.set(cards, { y: 60, opacity: 0, rotateX: -8, transformPerspective: 1200 });
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 1,
              stagger: 0.1,
              ease: "expo.out",
              clearProps: "transform,opacity",
            }),
        });
        gsap.utils.toArray<HTMLElement>("[data-catalog-media]").forEach((media) => {
          gsap.fromTo(
            media,
            { clipPath: "inset(12% 12% 12% 12% round 14px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 14px)",
              duration: 1.2,
              ease: "expo.out",
              clearProps: "clipPath",
              scrollTrigger: { trigger: media, start: "top 88%", once: true },
            }
          );
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={containerRef} className="catalog" data-src="src/components/WorkCatalog.tsx" data-anim-zone>
      <div className="catalog__bar">
        <div ref={filterBarRef} className="catalog__filters" role="tablist" aria-label="Filter projects by engineering layer">
          <span ref={pillRef} className="catalog__pill" aria-hidden="true" />
          {FILTERS.map((f) => {
            const active = tier === f.id;
            const count = countFor(f.id);
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="catalog__filter"
                disabled={count === 0}
                onClick={() => handleFilterSelect(f.id)}
              >
                <span>{f.label}</span>
                <span className="catalog__count measured">{String(count).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
        <p className="catalog__showing measured" aria-live="polite">
          showing <span className="text-accent">{String(visibleProjects.length).padStart(2, "0")}</span> / {String(PROJECTS.length).padStart(2, "0")}
        </p>
      </div>

      <div className="catalog__grid">
        {visibleProjects.map((project, i) => {
          const isLead = i === 0;
          return (
            <article
              key={project.slug}
              data-catalog-card
              data-flip-id={`project-${project.slug}`}
              className={`wcard${isLead ? " wcard--lead" : ""}`}
              onPointerMove={trackPointer}
            >
              <span className="wcard__rank" aria-hidden="true">
                {String(project.rank).padStart(2, "0")}
              </span>

              <div data-catalog-media className="wcard__media">
                {project.screenshotPath ? (
                  <Image
                    src={project.screenshotPath}
                    alt={project.screenshotAlt ?? `${project.name} screenshot`}
                    width={1440}
                    height={900}
                    priority={project.rank === 1}
                    sizes={isLead ? "(min-width: 60rem) 55vw, 100vw" : "(min-width: 60rem) 45vw, 100vw"}
                    className="wcard__img"
                  />
                ) : (
                  <div className="wcard__diagram">
                    <ArchDiagram nodes={project.architectureFlow} />
                  </div>
                )}
                <span className="wcard__media-tag measured">
                  {project.screenshotPath ? "live capture" : "architecture"}
                </span>
              </div>

              <div className="wcard__body">
                <div className="wcard__meta">
                  <span className="chip chip--instrument">{project.category}</span>
                  <span className="measured text-muted">{project.year}</span>
                </div>

                <h2 className="wcard__title">
                  <Link href={`/work/${project.slug}`} className="wcard__title-link">
                    {project.name}
                    <ArrowUpRight className="wcard__title-arrow" size={22} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </h2>
                <p className="wcard__tagline">{isLead ? project.summary : project.tagline}</p>

                <ul className="wcard__stack">
                  {project.stack.slice(0, isLead ? 6 : 4).map((tech) => (
                    <li key={tech} className="chip">
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="wcard__foot">
                  <span className="measured wcard__runtime">
                    <Code2 size={12} strokeWidth={1.75} aria-hidden="true" />
                    {project.runtime}
                  </span>
                  <span className="wcard__links">
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="pcard__link">
                      Source <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
                    </a>
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="pcard__link">
                        Live <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
                      </a>
                    )}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
