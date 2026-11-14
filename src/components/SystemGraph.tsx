"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import { INTRO_DONE_EVENT } from "@/components/PageLoader";
import { PROJECTS } from "@/data/projects";

/**
 * Hero stage: a live DAG of the portfolio. One request fans out into four
 * project nodes and converges on "deployed". Packets stream along every edge;
 * the node matching the headline's current phrase (or the hovered one) runs hot.
 */

// Same order as HERO_LOOP_PHRASES in Hero.tsx
const NODE_SLUGS = ["brainflow", "arcix", "arcwire", "assetsvista"] as const;

const NODES = NODE_SLUGS.map((slug, i) => {
  const p = PROJECTS.find((proj) => proj.slug === slug);
  return {
    slug,
    name: p?.name ?? slug,
    runtime: p?.runtime ?? "",
    category: p?.category ?? "",
    y: 62 + i * 92,
  };
});

const VB_W = 560;
const VB_H = 400;
const MID_Y = VB_H / 2;
const SRC = { x: 22, w: 104, h: 44 };
const MID = { x: 206, w: 152, h: 56 };
const OUT = { x: 438, w: 104, h: 44 };

const inEdge = (y: number) => {
  const x1 = SRC.x + SRC.w;
  const x2 = MID.x;
  const c = (x2 - x1) / 2;
  return `M${x1} ${MID_Y} C ${x1 + c} ${MID_Y}, ${x2 - c} ${y}, ${x2} ${y}`;
};

const outEdge = (y: number) => {
  const x1 = MID.x + MID.w;
  const x2 = OUT.x;
  const c = (x2 - x1) / 2;
  return `M${x1} ${y} C ${x1 + c} ${y}, ${x2 - c} ${MID_Y}, ${x2} ${MID_Y}`;
};

export function SystemGraph({ activeIndex }: { activeIndex: number }) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const hot = hovered ?? activeIndex;
  const hotNode = NODES[hot];

  // Build-in: edges draw themselves, then nodes pop in source → projects → output
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const edges = gsap.utils.toArray<SVGPathElement>("[data-graph-edge]");
      edges.forEach((edge) => {
        const len = edge.getTotalLength();
        gsap.set(edge, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set("[data-graph-node]", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", transformBox: "fill-box" });
      gsap.set("[data-graph-flow]", { opacity: 0 });

      const play = () => {
        gsap
          .timeline()
          .to("[data-graph-node='src']", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" })
          .to("[data-graph-edge='in']", { strokeDashoffset: 0, duration: 0.6, stagger: 0.08, ease: "power2.inOut" }, "-=0.15")
          .to("[data-graph-node='mid']", { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(2)" }, "-=0.35")
          .to("[data-graph-edge='out']", { strokeDashoffset: 0, duration: 0.6, stagger: 0.08, ease: "power2.inOut" }, "-=0.3")
          .to("[data-graph-node='out']", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.25")
          .set(edges, { clearProps: "strokeDasharray,strokeDashoffset" })
          .to("[data-graph-flow]", { opacity: 1, duration: 0.4 });
      };

      if (document.querySelector(".intro-overlay")) {
        window.addEventListener(INTRO_DONE_EVENT, play, { once: true });
        return () => window.removeEventListener(INTRO_DONE_EVENT, play);
      }
      play();
    }, svg);

    return () => ctx.revert();
  }, []);

  const go = (slug: string) => router.push(`/work/${slug}`);

  return (
    <div className="graph">
      <svg
        ref={svgRef}
        className="graph__svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="group"
        aria-label="Project pipeline: one request fans out to BrainFlow, Arcix, Arcwire and AssetsVista, then deploys"
      >
        {/* Edges: static rail + streaming packet overlay */}
        {NODES.map((n, i) => {
          const isHot = i === hot;
          return (
            <g key={`e-${n.slug}`} className={`graph__edge-group${isHot ? " is-hot" : ""}`}>
              <path data-graph-edge="in" className="graph__edge" d={inEdge(n.y)} />
              <path data-graph-edge="out" className="graph__edge" d={outEdge(n.y)} />
              <path data-graph-flow className="graph__flow" d={inEdge(n.y)} style={{ animationDelay: `${-i * 0.35}s` }} />
              <path data-graph-flow className="graph__flow graph__flow--out" d={outEdge(n.y)} style={{ animationDelay: `${-i * 0.35 - 0.6}s` }} />
            </g>
          );
        })}

        {/* Source */}
        <g data-graph-node="src" className="graph__node graph__node--io">
          <rect x={SRC.x} y={MID_Y - SRC.h / 2} width={SRC.w} height={SRC.h} rx={10} />
          <text x={SRC.x + SRC.w / 2} y={MID_Y - 2} className="graph__label">request</text>
          <text x={SRC.x + SRC.w / 2} y={MID_Y + 13} className="graph__sub">you → risu</text>
          <circle cx={SRC.x + SRC.w} cy={MID_Y} r={3.5} className="graph__port" />
        </g>

        {/* Project nodes */}
        {NODES.map((n, i) => {
          const isHot = i === hot;
          return (
            <g
              key={n.slug}
              data-graph-node="mid"
              className={`graph__node graph__node--mid${isHot ? " is-hot" : ""}`}
              role="link"
              tabIndex={0}
              aria-label={`${n.name}: ${n.runtime}. Open case study`}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              onClick={() => go(n.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(n.slug);
                }
              }}
            >
              <rect
                className="graph__ping"
                x={MID.x}
                y={n.y - MID.h / 2}
                width={MID.w}
                height={MID.h}
                rx={12}
              />
              <rect x={MID.x} y={n.y - MID.h / 2} width={MID.w} height={MID.h} rx={12} />
              <text x={MID.x + 14} y={n.y - 3} className="graph__label graph__label--start">
                {n.name}
              </text>
              <text x={MID.x + 14} y={n.y + 14} className="graph__sub graph__label--start">
                {n.category}
              </text>
              <text x={MID.x + MID.w - 12} y={n.y - 3} className="graph__idx">
                0{i + 1}
              </text>
              <circle cx={MID.x} cy={n.y} r={3.5} className="graph__port" />
              <circle cx={MID.x + MID.w} cy={n.y} r={3.5} className="graph__port" />
            </g>
          );
        })}

        {/* Output */}
        <g data-graph-node="out" className="graph__node graph__node--io graph__node--out">
          <rect x={OUT.x} y={MID_Y - OUT.h / 2} width={OUT.w} height={OUT.h} rx={10} />
          <text x={OUT.x + OUT.w / 2} y={MID_Y - 2} className="graph__label">deployed</text>
          <text x={OUT.x + OUT.w / 2} y={MID_Y + 13} className="graph__sub">200 OK</text>
          <circle cx={OUT.x} cy={MID_Y} r={3.5} className="graph__port" />
        </g>
      </svg>

      <div className="graph__readout measured">
        <span className="graph__readout-name">
          <span className="text-accent">0{hot + 1}</span> {hotNode.name}
        </span>
        <span className="graph__readout-runtime text-muted">{hotNode.runtime}</span>
        <Link href={`/work/${hotNode.slug}`} className="graph__readout-link">
          case study
          <ArrowUpRight size={12} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
