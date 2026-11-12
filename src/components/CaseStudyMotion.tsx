"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ArchitectureNode } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

export function CaseStudyWalkthrough({
  nodes,
  highlights,
  modules,
}: {
  nodes: ArchitectureNode[];
  highlights: string[];
  modules: { path: string; responsibility: string }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const busFillRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    const pin = pinRef.current;
    const steps = stepsRef.current;
    const bus = busFillRef.current;
    if (!grid || !pin || !steps) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 60rem)", () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: grid,
          start: "top 96px",
          end: () => `+=${Math.max(0, steps.offsetHeight - pin.offsetHeight)}`,
          pin,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });

        if (bus) {
          gsap.fromTo(
            bus,
            { strokeDashoffset: 180 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: steps,
                start: "top 55%",
                end: "bottom 55%",
                scrub: 0.3,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        const stepEls = gsap.utils.toArray<HTMLElement>("[data-walk-step]");
        stepEls.forEach((stepEl, index) => {
          ScrollTrigger.create({
            trigger: stepEl,
            start: "top 55%",
            end: "bottom 55%",
            onEnter: () => setActiveIndex(index),
            onEnterBack: () => setActiveIndex(index),
          });
        });
      }, grid);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [nodes.length]);

  const activeNode = nodes[activeIndex] ?? nodes[0];
  const activeModule = modules[activeIndex] ?? modules[0];

  return (
    <div ref={gridRef} className="walk-grid">
      <div ref={pinRef} className="walk-pin panel p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink">Signal walkthrough</span>
          <span className="measured text-cool">
            0{activeIndex + 1} / 0{nodes.length}
          </span>
        </div>

        <div className="flex gap-4 items-stretch py-2 border-y border-rule">
          <svg
            viewBox="0 0 24 200"
            width="24"
            height="200"
            aria-hidden="true"
            className="shrink-0"
          >
            <line
              x1="12"
              y1="10"
              x2="12"
              y2="190"
              stroke="var(--color-rule)"
              strokeWidth="2"
            />
            <line
              ref={busFillRef}
              x1="12"
              y1="10"
              x2="12"
              y2="190"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeDasharray="180"
              strokeDashoffset="180"
            />
            {nodes.map((node, i) => {
              const cy = nodes.length > 1 ? 10 + (180 / (nodes.length - 1)) * i : 100;
              const passed = i <= activeIndex;
              return (
                <circle
                  key={node.id}
                  cx="12"
                  cy={cy}
                  r="4"
                  fill={passed ? "var(--color-accent)" : "var(--color-paper-3)"}
                  stroke={passed ? "var(--color-accent)" : "var(--color-rule-2)"}
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          <ol className="flex flex-col justify-between flex-1 py-0.5">
            {nodes.map((node, i) => {
              const current = i === activeIndex;
              return (
                <li key={node.id} className="flex items-baseline justify-between gap-2 text-sm">
                  <button
                    type="button"
                    className={`text-left transition-colors ${
                      current ? "text-accent font-medium" : "text-muted hover:text-ink"
                    }`}
                    onClick={() => setActiveIndex(i)}
                  >
                    0{i + 1} {node.label}
                  </button>
                  <span className="measured text-xs text-cool">{node.role}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {activeNode && (
          <div className="grid gap-2">
            <span className={`measured ${activeNode.layer === "person" ? "text-accent" : "text-cool"}`}>
              Active stage: {activeNode.role}
            </span>
            <p className="text-sm text-ink-2">{activeNode.detail}</p>
            {activeModule && (
              <div className="mt-2 pt-3 border-t border-rule grid gap-1">
                <span className="measured text-xs text-cool">{activeModule.path}</span>
                <span className="text-xs text-muted">{activeModule.responsibility}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <ol ref={stepsRef} className="walk-steps">
        {nodes.map((node, i) => {
          const isActive = i === activeIndex;
          const note = highlights[i];
          return (
            <li
              key={node.id}
              data-walk-step
              data-active={isActive ? "true" : "false"}
              className="panel walk-step-card"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className={`measured ${node.layer === "person" ? "text-accent" : "text-cool"}`}>
                  0{i + 1} {node.role}
                </span>
                {modules[i] && (
                  <span className="measured text-xs text-muted">{modules[i].path}</span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-medium text-ink">{node.label}</h3>
                <p className="text-sm text-ink-2 mt-2">{node.detail}</p>
              </div>

              {note && (
                <p className="text-sm text-muted pt-3 border-t border-rule">{note}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function CaseStudyMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-case-hero]",
          { y: 12, opacity: 0.35 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );

        ScrollTrigger.batch("[data-case-row]", {
          start: "top 90%",
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { x: -10, opacity: 0.3 },
              {
                x: 0,
                opacity: 1,
                duration: 0.32,
                stagger: 0.04,
                ease: "power3.out",
                clearProps: "transform,opacity",
              }
            );
          },
        });

        const parallaxMedia = gsap.utils.toArray<HTMLElement>("[data-case-parallax]");
        parallaxMedia.forEach((media) => {
          gsap.fromTo(
            media,
            { y: 14 },
            {
              y: -14,
              ease: "none",
              scrollTrigger: {
                trigger: media,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        });
      }, root);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
