"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Download } from "lucide-react";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

const MONTHS = 18; // Dec 2023 → May 2025 at Last Search
const CGPI = 8.7;

/** Short deterministic hex "hash" so commit rows look like a real log. */
function shortHash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

const exp = PROFILE.experience[0];
const edu = PROFILE.education[0];

const COMMITS = [
  {
    head: true,
    type: "status",
    date: "now",
    message: "open to full-time engineering roles",
    detail: PROFILE.availability,
    tags: ["available"],
  },
  {
    type: "feat",
    date: exp.period,
    message: `${exp.role} @ ${exp.organization}`,
    detail: exp.highlights[0],
    tags: exp.stack.slice(0, 5),
  },
  {
    type: "edu",
    date: edu.period,
    message: "B.Sc. Information Technology",
    detail: `${edu.institution}. ${edu.score}.`,
    tags: ["CGPI 8.70"],
  },
  {
    type: "win",
    date: "college",
    message: "1st place, college coding competition",
    detail: "C++, data structures, algorithms and problem-solving under time pressure.",
    tags: ["C++", "DSA"],
  },
];

export function ProofSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // Gauges fill once when they enter
        const counters = gsap.utils.toArray<HTMLElement>("[data-proof-count]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.querySelector(".proof__gauges"), start: "top 80%", once: true },
        });
        tl.fromTo(".proof__ring-fill", { strokeDashoffset: 100 }, { strokeDashoffset: 100 - CGPI * 10, duration: 1.6, ease: "expo.out" }, 0)
          .fromTo(".proof__month", { scaleY: 0.15, opacity: 0.25 }, { scaleY: 1, opacity: 1, duration: 0.5, stagger: 0.045, ease: "back.out(2)" }, 0.1)
          .fromTo(".proof__repo", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(3)" }, 0.2)
          .fromTo(".proof__repo-link", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.06, ease: "power2.out" }, 0.5)
          .fromTo(".proof__podium-bar", { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.9, stagger: 0.12, ease: "expo.out" }, 0.3);
        counters.forEach((el) => {
          const target = Number(el.dataset.proofCount);
          const decimals = Number(el.dataset.decimals ?? 0);
          const obj = { v: 0 };
          tl.to(obj, {
            v: target,
            duration: 1.6,
            ease: "expo.out",
            onUpdate: () => {
              el.textContent = `${el.dataset.prefix ?? ""}${obj.v.toFixed(decimals)}${el.dataset.suffix ?? ""}`;
            },
          }, 0);
        });

        // Commit log: branch line fills with scroll, nodes light up as they pass
        const log = root.querySelector<HTMLElement>(".clog");
        if (log) {
          gsap.fromTo(
            ".clog__fill",
            { scaleY: 0 },
            { scaleY: 1, ease: "none", scrollTrigger: { trigger: log, start: "top 70%", end: "bottom 60%", scrub: 0.4 } }
          );
          gsap.utils.toArray<HTMLElement>(".clog__row").forEach((row) => {
            ScrollTrigger.create({ trigger: row, start: "top 68%", toggleClass: { targets: row, className: "is-on" } });
            gsap.from(row, {
              x: -24,
              opacity: 0,
              duration: 0.8,
              ease: "expo.out",
              scrollTrigger: { trigger: row, start: "top 88%", once: true },
            });
          });
        }
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  // 8 repos laid out as a 4×2 constellation
  const repoNodes = PROJECTS.map((p, i) => ({ slug: p.slug, x: 14 + (i % 4) * 30, y: i < 4 ? 16 : 44 }));

  return (
    <div ref={rootRef} className="proof" data-anim-zone>
      <div className="proof__gauges">
        <figure className="gauge">
          <svg viewBox="0 0 100 100" className="gauge__svg" aria-hidden="true">
            <circle cx="50" cy="50" r="40" className="proof__ring-track" />
            <circle cx="50" cy="50" r="40" pathLength={100} className="proof__ring-fill" />
            {Array.from({ length: 10 }, (_, i) => (
              <line
                key={i}
                x1="50"
                y1="4"
                x2="50"
                y2="8"
                className="proof__tick"
                transform={`rotate(${i * 36} 50 50)`}
              />
            ))}
          </svg>
          <figcaption className="gauge__caption">
            <span className="gauge__value" data-proof-count={CGPI} data-decimals={2}>
              {CGPI.toFixed(2)}
            </span>
            <span className="gauge__label">CGPI / 10, B.Sc. IT</span>
          </figcaption>
        </figure>

        <figure className="gauge">
          <svg viewBox="0 0 120 60" className="gauge__svg gauge__svg--wide" aria-hidden="true">
            {Array.from({ length: MONTHS }, (_, i) => (
              <rect
                key={i}
                x={4 + i * 6.3}
                y={i % 12 === 1 ? 10 : 16}
                width="4.3"
                height={i % 12 === 1 ? 34 : 28}
                rx="1.2"
                className={`proof__month${i % 12 === 1 ? " proof__month--year" : ""}`}
              />
            ))}
            <text x="4" y="56" className="proof__axis">Dec 23</text>
            <text x="116" y="56" className="proof__axis proof__axis--end">May 25</text>
          </svg>
          <figcaption className="gauge__caption">
            <span className="gauge__value" data-proof-count={1.5} data-decimals={1} data-suffix="y">
              1.5y
            </span>
            <span className="gauge__label">production web, {MONTHS} months</span>
          </figcaption>
        </figure>

        <figure className="gauge">
          <svg viewBox="0 0 120 60" className="gauge__svg gauge__svg--wide" aria-hidden="true">
            {repoNodes.slice(0, -1).map((n, i) => {
              const next = repoNodes[i + 1];
              return (
                <line
                  key={`l-${n.slug}`}
                  x1={n.x}
                  y1={n.y}
                  x2={next.x}
                  y2={next.y}
                  pathLength={1}
                  className="proof__repo-link"
                />
              );
            })}
            {repoNodes.map((n) => (
              <circle key={n.slug} cx={n.x} cy={n.y} r="5" className="proof__repo" />
            ))}
          </svg>
          <figcaption className="gauge__caption">
            <span className="gauge__value" data-proof-count={PROJECTS.length} data-decimals={0}>
              {PROJECTS.length}
            </span>
            <span className="gauge__label">systems shipped to GitHub</span>
          </figcaption>
        </figure>

        <figure className="gauge">
          <svg viewBox="0 0 120 60" className="gauge__svg gauge__svg--wide" aria-hidden="true">
            <rect x="18" y="30" width="26" height="26" rx="3" className="proof__podium-bar" />
            <rect x="47" y="10" width="26" height="46" rx="3" className="proof__podium-bar proof__podium-bar--win" />
            <rect x="76" y="38" width="26" height="18" rx="3" className="proof__podium-bar" />
            <text x="60" y="38" className="proof__podium-num">1</text>
          </svg>
          <figcaption className="gauge__caption">
            <span className="gauge__value" data-proof-count={1} data-decimals={0} data-prefix="#">
              #1
            </span>
            <span className="gauge__label">college coding competition</span>
          </figcaption>
        </figure>
      </div>

      <div className="clog" role="list" aria-label="Career log">
        <div className="clog__titlebar measured">
          <span className="text-accent">$</span> git log --graph --oneline <span className="text-muted">career</span>
        </div>
        <div className="clog__body">
          <span className="clog__rail" aria-hidden="true">
            <span className="clog__fill" />
          </span>
          {COMMITS.map((c) => (
            <div key={c.message} role="listitem" className={`clog__row${c.head ? " clog__row--head" : ""}`}>
              <span className="clog__node" aria-hidden="true" />
              <div className="clog__line measured">
                <span className="clog__hash">{shortHash(c.message)}</span>
                {c.head && <span className="clog__ref">HEAD → main</span>}
                <span className={`clog__type clog__type--${c.type}`}>{c.type}:</span>
                <span className="clog__msg">{c.message}</span>
                <span className="clog__date">{c.date}</span>
              </div>
              <p className="clog__detail">{c.detail}</p>
              <ul className="clog__tags">
                {c.tags.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="clog__foot">
          <Link href="/resume" className="pcard__link">
            Full resume <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <a href={PROFILE.resumePdfPath} download className="pcard__link">
            Download PDF <Download size={14} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
