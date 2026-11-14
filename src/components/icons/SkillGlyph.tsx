import type { ReactNode } from "react";

/**
 * Hand-drawn monoline glyph set (24×24, stroke-based) so every icon can "draw itself"
 * via stroke-dashoffset. Every stroked element carries pathLength=1, which lets CSS
 * animate any shape with the same 1 → 0 dash offset.
 */

const P = { pathLength: 1 } as const;

const mono = (label: string, size = 8.5): ReactNode => (
  <>
    <rect {...P} x="3" y="3" width="18" height="18" rx="4" />
    <text x="12" y="15.4" className="glyph-text" style={{ fontSize: size }}>
      {label}
    </text>
  </>
);

export const GLYPHS = {
  typescript: mono("TS"),
  javascript: mono("JS"),
  csharp: mono("C#"),
  cpp: mono("C++", 6.8),
  sql: mono("SQL", 6.6),
  react: (
    <>
      <ellipse {...P} cx="12" cy="12" rx="10" ry="4" />
      <ellipse {...P} cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse {...P} cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.6" className="glyph-fill" />
    </>
  ),
  next: (
    <>
      <circle {...P} cx="12" cy="12" r="9.5" />
      <path {...P} d="M9 16.5V7.5l7.5 10.2M15.5 7.5v6" />
    </>
  ),
  node: (
    <>
      <path {...P} d="M12 2.5l8.3 4.75v9.5L12 21.5l-8.3-4.75v-9.5z" />
      <path {...P} d="M9.5 15V10l5 5v-5" />
    </>
  ),
  electron: (
    <>
      <ellipse {...P} cx="12" cy="12" rx="10" ry="3.6" transform="rotate(30 12 12)" />
      <ellipse {...P} cx="12" cy="12" rx="10" ry="3.6" transform="rotate(-30 12 12)" />
      <circle {...P} cx="12" cy="12" r="2" />
      <circle cx="12" cy="12" r="1" className="glyph-fill glyph-orbit" />
    </>
  ),
  webrtc: (
    <>
      <circle {...P} cx="5" cy="12" r="2.5" />
      <circle {...P} cx="19" cy="12" r="2.5" />
      <path {...P} d="M9 8.5a5 5 0 0 1 6 0M10.5 11a2.4 2.4 0 0 1 3 0" />
      <path d="M7.5 12h9" strokeDasharray="1.5 2" />
    </>
  ),
  websocket: (
    <>
      <path {...P} d="M3 9h15l-3.5-3.5M21 15H6l3.5 3.5" />
    </>
  ),
  windows: (
    <>
      <rect {...P} x="3" y="3" width="8" height="8" rx="1" />
      <rect {...P} x="13" y="3" width="8" height="8" rx="1" />
      <rect {...P} x="3" y="13" width="8" height="8" rx="1" />
      <rect {...P} x="13" y="13" width="8" height="8" rx="1" />
    </>
  ),
  database: (
    <>
      <ellipse {...P} cx="12" cy="5.5" rx="7.5" ry="2.8" />
      <path {...P} d="M4.5 5.5v13c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-13" />
      <path {...P} d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />
    </>
  ),
  leaf: (
    <>
      <path {...P} d="M12 2.5c4.5 3.4 5.6 8.6 3.3 13.2-.9 1.8-2.1 3.1-3.3 4.3-1.2-1.2-2.4-2.5-3.3-4.3C6.4 11.1 7.5 5.9 12 2.5z" />
      <path {...P} d="M12 7v14.5" />
    </>
  ),
  prism: (
    <>
      <path {...P} d="M12 2.5L20 19l-9 2.5L4 15.5z" />
      <path {...P} d="M12 2.5l-1 19" />
    </>
  ),
  trpc: (
    <>
      <path {...P} d="M8 6l-5 6 5 6M16 6l5 6-5 6" />
      <path {...P} d="M10 15l4-6" />
    </>
  ),
  wind: (
    <>
      <path {...P} d="M3 10c2-3 4-4 6.5-3s3.5 3 6 3 3.5-1 5.5-3" />
      <path {...P} d="M3 17c2-3 4-4 6.5-3s3.5 3 6 3 3.5-1 5.5-3" />
    </>
  ),
  bezier: (
    <>
      <path {...P} d="M4 19C7 6 17 18 20 5" />
      <path d="M4 19l4-12M20 5l-4 12" strokeDasharray="1.5 2" opacity="0.6" />
      <circle cx="8" cy="7" r="1.5" className="glyph-fill" />
      <circle cx="16" cy="17" r="1.5" className="glyph-fill" />
    </>
  ),
  dag: (
    <>
      <circle {...P} cx="5" cy="12" r="2.3" />
      <circle {...P} cx="12" cy="5" r="2.3" />
      <circle {...P} cx="12" cy="19" r="2.3" />
      <circle {...P} cx="19" cy="12" r="2.3" />
      <path {...P} d="M6.7 10.4l3.6-3.7M6.7 13.6l3.6 3.7M13.7 6.7l3.6 3.7M13.7 17.3l3.6-3.7" />
    </>
  ),
  sparkle: (
    <>
      <path {...P} d="M12 2.5c.8 4.9 2.6 6.7 7.5 7.5-4.9.8-6.7 2.6-7.5 7.5-.8-4.9-2.6-6.7-7.5-7.5 4.9-.8 6.7-2.6 7.5-7.5z" />
      <path {...P} d="M19 16.5v4M17 18.5h4" />
    </>
  ),
  sandbox: (
    <>
      <path {...P} d="M12 2.5l8.5 4.5v10L12 21.5 3.5 17V7z" />
      <path {...P} d="M3.5 7L12 11.5 20.5 7M12 11.5v10" />
    </>
  ),
  branch: (
    <>
      <circle {...P} cx="6" cy="5" r="2.2" />
      <circle {...P} cx="6" cy="19" r="2.2" />
      <circle {...P} cx="18" cy="8" r="2.2" />
      <path {...P} d="M6 7.2v9.6M18 10.2c0 4-6 3.5-11 6.8" />
    </>
  ),
  plane: (
    <>
      <path {...P} d="M21 3L3 10.5l7 2.5 2.5 7z" />
      <path {...P} d="M21 3L10 13" />
    </>
  ),
  bolt: (
    <>
      <path {...P} d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z" />
    </>
  ),
  loop: (
    <>
      <path {...P} d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" />
      <path {...P} d="M18 2.5v4h-4M6 21.5v-4h4" />
    </>
  ),
  scroll: (
    <>
      <rect {...P} x="7" y="2.5" width="10" height="19" rx="5" />
      <path {...P} d="M12 6.5v3.5" className="glyph-scroll" />
    </>
  ),
  lock: (
    <>
      <rect {...P} x="4.5" y="10.5" width="15" height="11" rx="2.5" />
      <path {...P} d="M8 10.5V7a4 4 0 0 1 8 0v3.5M12 14.5v3" />
    </>
  ),
  layers: (
    <>
      <path {...P} d="M12 3l9 4.5-9 4.5-9-4.5z" />
      <path {...P} d="M3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5" />
    </>
  ),
  table: (
    <>
      <rect {...P} x="3" y="4" width="18" height="16" rx="2.5" />
      <path {...P} d="M3 9.5h18M3 14.5h18M9.5 4v16" />
    </>
  ),
  check: (
    <>
      <path {...P} d="M12 2.5l8 3v6c0 4.8-3.4 8.7-8 10-4.6-1.3-8-5.2-8-10v-6z" />
      <path {...P} d="M8.5 12l2.5 2.5 4.8-5" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof GLYPHS;

export function SkillGlyph({ name, className }: { name: GlyphName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`glyph ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}
