"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Pause, Play } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { SkillGlyph, type GlyphName } from "@/components/icons/SkillGlyph";
import { DomainGlyph } from "@/components/icons/DomainGlyph";
import { PROFILE } from "@/data/profile";

type Skill = { label: string; glyph: GlyphName; tone?: "cool" };

const ROW_A: Skill[] = [
  { label: "TypeScript", glyph: "typescript" },
  { label: "React 19", glyph: "react", tone: "cool" },
  { label: "Next.js 16", glyph: "next" },
  { label: "Node.js", glyph: "node" },
  { label: "Electron 34", glyph: "electron", tone: "cool" },
  { label: "C# Win32", glyph: "csharp" },
  { label: "WebRTC", glyph: "webrtc", tone: "cool" },
  { label: "WebSocket", glyph: "websocket" },
  { label: "Tailwind CSS", glyph: "wind", tone: "cool" },
  { label: "GSAP", glyph: "bezier" },
  { label: "Vite", glyph: "bolt", tone: "cool" },
  { label: "Redux / Saga", glyph: "loop" },
  { label: "Lenis", glyph: "scroll", tone: "cool" },
];

const ROW_B: Skill[] = [
  { label: "PostgreSQL", glyph: "database", tone: "cool" },
  { label: "MongoDB", glyph: "leaf" },
  { label: "SQLite WAL", glyph: "database" },
  { label: "Prisma", glyph: "prism", tone: "cool" },
  { label: "tRPC", glyph: "trpc" },
  { label: "Inngest DAGs", glyph: "dag", tone: "cool" },
  { label: "Multi-LLM", glyph: "sparkle" },
  { label: "E2B Sandbox", glyph: "sandbox", tone: "cool" },
  { label: "TLS 1.3 / DPAPI", glyph: "lock" },
  { label: "TanStack", glyph: "table", tone: "cool" },
  { label: "Git / GitHub", glyph: "branch" },
  { label: "Postman", glyph: "plane", tone: "cool" },
  { label: "C++ / DSA", glyph: "cpp" },
  { label: "QA & UAT", glyph: "check", tone: "cool" },
];

function MarqueeRow({ items, reverse }: { items: Skill[]; reverse?: boolean }) {
  // Content is doubled so the track can loop at -50% seamlessly
  return (
    <div className={`skill-row${reverse ? " skill-row--reverse" : ""}`}>
      <ul className="skill-row__track">
        {[...items, ...items].map((s, i) => (
          <li
            key={`${s.label}-${i}`}
            className={`skill-tile${s.tone === "cool" ? " skill-tile--cool" : ""}`}
            aria-hidden={i >= items.length}
          >
            <span className="skill-tile__icon">
              <SkillGlyph name={s.glyph} />
            </span>
            <span className="skill-tile__label">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillsShowcase() {
  const [running, setRunning] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  // Domain emblems draw themselves once the grid scrolls into view
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".domain-card"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            card.dataset.inview = "true";
            io.unobserve(card);
            const strokes = card.querySelectorAll(".dglyph [pathLength]");
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              gsap.set(strokes, { strokeDashoffset: 0 });
            } else {
              gsap.fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.04, ease: "power3.out", delay: 0.15 });
            }
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section id="skills" className="skills-section" data-src="src/components/SkillsShowcase.tsx" aria-labelledby="skills-heading" data-anim-zone>
      <div className="container skills-head">
        <SectionHeading index="03" kicker="toolbox" title="The *stack* behind it" id="skills-heading" align="center" />
        <p data-reveal className="lead text-ink-2">
          From kernel-adjacent Win32 input to multi-LLM pipelines: the stack behind every build.
        </p>
      </div>

      <div className="skill-marquee" data-running={running}>
        <MarqueeRow items={ROW_A} />
        <MarqueeRow items={ROW_B} reverse />
      </div>

      <div className="container">
        <div className="skill-marquee__controls">
          <button
            type="button"
            className="btn btn--compact"
            aria-label={running ? "Pause skills marquee" : "Play skills marquee"}
            onClick={() => setRunning((v) => !v)}
          >
            {running ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            <span>{running ? "Pause" : "Play"}</span>
          </button>
          <span className="measured text-muted hover-hint">hover a tile to redraw it</span>
        </div>

        <div ref={gridRef} className="domain-grid">
          {PROFILE.skills.map((group, i) => (
            <article key={group.id} className="domain-card" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="domain-card__emblem">
                <DomainGlyph id={group.id} />
                <span className="domain-card__index measured">0{i + 1}</span>
              </div>
              <h3 className="domain-card__title">{group.domain}</h3>
              <p className="domain-card__summary">{group.summary}</p>
              <ul className="domain-card__chips">
                {group.items.slice(0, 6).map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
