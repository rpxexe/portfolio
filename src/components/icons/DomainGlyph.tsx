/**
 * Large animated emblems for the five skill domains (64×64).
 * Strokes with pathLength=1 draw in when an ancestor gets [data-inview="true"];
 * the looping motion (signals, floats, clicks) is pure CSS, see globals.css "Domain glyphs".
 */

const P = { pathLength: 1 } as const;

function Systems() {
  return (
    <>
      {/* pins */}
      {[18, 26, 34, 42].map((v) => (
        <g key={v}>
          <path {...P} d={`M${v + 2} 6v8M${v + 2} 50v8M6 ${v + 2}h8M50 ${v + 2}h8`} />
        </g>
      ))}
      <rect {...P} x="14" y="14" width="36" height="36" rx="6" />
      <rect {...P} x="23" y="23" width="18" height="18" rx="3" className="dg-core" />
      {/* signal trace running into the die */}
      <path d="M6 28h8c4 0 5 4 9 4" className="dg-signal" />
      <path d="M58 36h-8c-4 0-5-4-9-4" className="dg-signal dg-signal--rev" />
    </>
  );
}

function Ai() {
  const L1 = [18, 46];
  const L2 = [12, 32, 52];
  const L3 = [22, 42];
  const edges: string[] = [];
  L1.forEach((a) => L2.forEach((b) => edges.push(`M10 ${a}L32 ${b}`)));
  L2.forEach((a) => L3.forEach((b) => edges.push(`M32 ${a}L54 ${b}`)));
  return (
    <>
      {edges.map((d, i) => (
        <path key={d} {...P} d={d} className="dg-edge" style={{ animationDelay: `${(i % 6) * 0.25}s` }} />
      ))}
      {L1.map((y) => <circle key={`a${y}`} {...P} cx="10" cy={y} r="4" className="dg-node" />)}
      {L2.map((y, i) => (
        <circle key={`b${y}`} {...P} cx="32" cy={y} r="4.5" className="dg-node dg-node--pulse" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      {L3.map((y) => <circle key={`c${y}`} {...P} cx="54" cy={y} r="4" className="dg-node" />)}
    </>
  );
}

function FullStack() {
  const layer = "M32 10l22 11-22 11-22-11z";
  return (
    <>
      <g className="dg-float dg-float--3">
        <path {...P} d={layer} transform="translate(0 24)" className="dg-layer" />
      </g>
      <g className="dg-float dg-float--2">
        <path {...P} d={layer} transform="translate(0 12)" className="dg-layer" />
      </g>
      <g className="dg-float dg-float--1">
        <path {...P} d={layer} className="dg-layer dg-layer--top" />
      </g>
    </>
  );
}

function Frontend() {
  return (
    <>
      <rect {...P} x="6" y="10" width="52" height="40" rx="6" />
      <path {...P} d="M6 19h52" />
      <circle cx="12" cy="14.5" r="1.4" className="dg-dot" />
      <circle cx="17" cy="14.5" r="1.4" className="dg-dot" />
      <circle cx="22" cy="14.5" r="1.4" className="dg-dot" />
      <rect {...P} x="12" y="25" width="18" height="18" rx="3" className="dg-block dg-block--a" />
      <path {...P} d="M36 27h16M36 33h12M36 39h14" />
      {/* cursor that travels and clicks */}
      <g className="dg-cursor">
        <path d="M0 0l0 13 3.6-3.4 2.6 5.6 2.4-1.1-2.6-5.5 5-.4z" className="dg-cursor__arrow" />
        <circle r="5" className="dg-cursor__ring" />
      </g>
    </>
  );
}

function Quality() {
  return (
    <>
      <path {...P} d="M32 5l21 8v15c0 13-9 23-21 30-12-7-21-17-21-30V13z" />
      <path {...P} d="M22 32l7 7 14-15" className="dg-check" />
      <path d="M15 22h34" className="dg-scan" />
    </>
  );
}

const MAP = {
  systems: Systems,
  ai: Ai,
  fullstack: FullStack,
  frontend: Frontend,
  quality: Quality,
} as const;

export type DomainId = keyof typeof MAP;

export function DomainGlyph({ id }: { id: string }) {
  const Glyph = MAP[id as DomainId] ?? Systems;
  return (
    <svg
      viewBox="0 0 64 64"
      className={`dglyph dglyph--${id}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <Glyph />
    </svg>
  );
}
