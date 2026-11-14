"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { DomainGlyph } from "@/components/icons/DomainGlyph";

const PRINCIPLES = [
  {
    code: "01",
    title: "Native Win32 precision",
    summary: "When the browser can't reach the OS, go native: a zero-dependency C# SendInput binary drives the real cursor.",
    glyph: "systems",
    proof: { name: "Arcix", slug: "arcix" },
    points: ["Sub-millisecond input synthesis", "Ctrl+Alt+Shift+Esc kill-switch", "26-assertion integration suite"],
  },
  {
    code: "02",
    title: "Durable AI DAGs",
    summary: "LLM steps fail and time out. Graphs get toposorted, then every step runs as a retryable background job.",
    glyph: "ai",
    proof: { name: "BrainFlow", slug: "brainflow" },
    points: ["Toposort-validated execution order", "Inngest retries + realtime telemetry", "OpenAI · Gemini · Anthropic routing"],
  },
  {
    code: "03",
    title: "Zero-cloud crypto",
    summary: "Private by construction: peers discover each other on the LAN and identities never leave the machine.",
    glyph: "quality",
    proof: { name: "Arcwire", slug: "arcwire" },
    points: ["UDP discovery, TLS 1.3 transport", "Ed25519 identities in Windows DPAPI", "Zod-validated typed IPC"],
  },
  {
    code: "04",
    title: "Transactional clarity",
    summary: "Destructive operations preview first and commit atomically, so data never lands half-written.",
    glyph: "fullstack",
    proof: { name: "AssetsVista", slug: "assetsvista" },
    points: ["Zero-write Excel dry runs", "1-click atomic offboarding", "SHA-256 hashed access tokens"],
  },
];

/**
 * Expanding panels: four slim columns; the active one widens to reveal its emblem,
 * reasoning, proof points and the project where it shipped. Hover or click on
 * desktop, accordion on phones.
 */
export function PrinciplesPanels() {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // First time the section scrolls into view, unlock the emblem draw
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Draw the open panel's emblem each time a panel opens
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !seen) return;
    const strokes = root.querySelectorAll(`.pp__panel[data-open="true"] .dglyph [pathLength]`);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(strokes, { strokeDashoffset: 0 });
      return;
    }
    const tween = gsap.fromTo(
      strokes,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.3, stagger: 0.03, ease: "power3.out", delay: 0.2 }
    );
    return () => {
      tween.kill();
    };
  }, [active, seen]);

  return (
    <div ref={rootRef} className="pp" data-anim-zone>
      {PRINCIPLES.map((p, i) => {
        const isOpen = i === active;
        return (
          <article
            key={p.code}
            className="pp__panel"
            data-open={isOpen}
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
            data-inview={isOpen ? "true" : undefined}
          >
            <button
              type="button"
              className="pp__head"
              aria-expanded={isOpen}
              aria-controls={`pp-body-${p.code}`}
              onClick={() => setActive(i)}
            >
              <span className="pp__code measured">{p.code}</span>
              <span className="pp__title">{p.title}</span>
              <Plus className="pp__plus" size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>

            <div id={`pp-body-${p.code}`} className="pp__body" inert={!isOpen}>
              <div className="pp__body-inner">
                <div className="pp__emblem" aria-hidden="true">
                  <DomainGlyph id={p.glyph} />
                </div>
                <p className="pp__summary">{p.summary}</p>
                <ul className="pp__points">
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <Link href={`/work/${p.proof.slug}`} className="pp__proof">
                  <span className="measured text-muted">shipped in</span>
                  <span className="pp__proof-name">{p.proof.name}</span>
                  <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
