"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { WobbleCard } from "@/components/WobbleCard";
import { PROJECTS, type ProjectTier } from "@/data/projects";

gsap.registerPlugin(Flip, ScrollTrigger);

const FILTERS: { id: "all" | ProjectTier; label: string }[] = [
  { id: "all", label: "All systems" },
  { id: "systems", label: "Systems & Desktop" },
  { id: "ai", label: "AI & Automation" },
  { id: "fullstack", label: "Full-Stack SaaS" },
  { id: "web", label: "Mobile & Web" },
];

export function WorkCatalog() {
  const [tier, setTier] = useState<"all" | ProjectTier>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const visibleProjects =
    tier === "all" ? PROJECTS : PROJECTS.filter((p) => p.tier === tier);

  function handleFilterSelect(nextTier: "all" | ProjectTier) {
    if (nextTier === tier) return;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && containerRef.current) {
      flipStateRef.current = Flip.getState(
        containerRef.current.querySelectorAll("[data-catalog-card], [data-flip-id='filter-bar']")
      );
    }
    setTier(nextTier);
  }

  useLayoutEffect(() => {
    const state = flipStateRef.current;
    flipStateRef.current = null;
    if (!state || !containerRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      Flip.from(state, {
        duration: 0.42,
        ease: "power3.inOut",
        stagger: 0.03,
        absolute: true,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0.25, y: 14 },
            { opacity: 1, y: 0, duration: 0.32, ease: "power3.out" }
          ),
        clearProps: "all",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [tier]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const mediaEls = gsap.utils.toArray<HTMLElement>("[data-catalog-media]");
        mediaEls.forEach((media) => {
          gsap.fromTo(
            media,
            { y: 14 },
            {
              y: -14,
              ease: "none",
              scrollTrigger: {
                trigger: media.closest("[data-catalog-card]") ?? media,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.45,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      }, root);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [tier]);

  return (
    <div ref={containerRef} className="flex flex-col gap-10">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter projects by engineering layer"
      >
        {FILTERS.map((f) => {
          const active = tier === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              className="btn btn--compact filter-tab"
              onClick={() => handleFilterSelect(f.id)}
            >
              <span>{f.label}</span>
              {active && <span className="filter-tab__bar" data-flip-id="filter-bar" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="panel-grid">
        {visibleProjects.map((project) => (
          <article
            key={project.slug}
            data-catalog-card
            data-flip-id={`project-${project.slug}`}
            className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="measured text-cool">
                  rank 0{project.rank}
                </span>
                <span className="chip chip--instrument">{project.category}</span>
                <span className="measured text-muted">{project.runtime}</span>
              </div>

              <div>
                <h2 className="text-2xl font-medium text-ink">
                  <Link href={`/work/${project.slug}`} className="hover:text-accent transition-colors">
                    {project.name}
                  </Link>
                </h2>
                <p className="text-ink-2 mt-2">{project.summary}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.stack.slice(0, 4).map((tech) => (
                  <span key={tech} className="chip">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2 text-sm">
                <Link href={`/work/${project.slug}`} className="text-link font-medium">
                  Read case study
                </Link>
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  GitHub repository
                </a>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-link"
                  >
                    <span>Live deployment</span>
                    <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>

            <div data-catalog-media className="lg:col-span-5">
              {project.screenshotPath ? (
                <WobbleCard tilt={6.5} wobble={1.25} className="rounded-xl">
                  <figure className="capture-frame">
                    <Image
                      src={project.screenshotPath}
                      alt={project.screenshotAlt ?? `${project.name} screenshot`}
                      width={1440}
                      height={900}
                      priority={project.rank === 1}
                      className="capture-frame__media"
                    />
                  </figure>
                </WobbleCard>
              ) : (
                <WobbleCard tilt={5.5} wobble={1.1} className="rounded-xl">
                  <div className="well p-5 flex flex-col gap-3">
                    <span className="measured text-cool">Architecture pipeline</span>
                    <ol className="grid gap-2">
                      {project.architectureFlow.map((node, index) => (
                        <li key={node.id} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-rule last:border-0">
                          <span className="text-sm font-medium text-ink">
                            0{index + 1} {node.label}
                          </span>
                          <span className={`measured ${node.layer === "person" ? "text-accent" : "text-cool"}`}>
                            {node.role}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </WobbleCard>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
