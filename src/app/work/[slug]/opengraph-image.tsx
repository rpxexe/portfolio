import { ImageResponse } from "next/og";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";

// Link-preview card per case study: name, tagline and the architecture flow as a row of nodes
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study architecture card";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

const C = { bg: "#0b0f14", panel: "#121821", rule: "#243040", ink: "#eef3f8", ink2: "#c3ccd6", muted: "#8b97a5", accent: "#3ce8b2", cool: "#5cc6e8" };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug) ?? PROJECTS[0];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: C.bg, padding: 64, color: C.ink }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24, color: C.muted }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="40" height="40" viewBox="0 0 64 64">
              <path d="M23 47V17h11.5a8.5 8.5 0 0 1 0 17H23M33 34l10 13" fill="none" stroke={C.accent} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="47" cy="17" r="4" fill={C.cool} />
            </svg>
            <span>risu / work / {p.slug}</span>
          </div>
          <span style={{ color: C.accent }}>{p.category}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{p.name}</div>
          <div style={{ fontSize: 36, color: C.ink2, lineHeight: 1.25, maxWidth: 1072 }}>{p.tagline}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {p.architectureFlow.map((n, i) => (
            <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 0", minWidth: 0 }}>
              {i > 0 && <span style={{ color: C.muted, fontSize: 28, flexShrink: 0 }}>→</span>}
              <div
                style={{
                  display: "flex",
                  flex: "1 1 0",
                  minWidth: 0,
                  flexDirection: "column",
                  gap: 4,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: C.panel,
                  border: `2px solid ${i === 0 ? C.accent : C.rule}`,
                }}
              >
                <span style={{ fontSize: 16, color: C.muted }}>{n.role}</span>
                <span style={{ fontSize: 21 }}>{n.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: C.muted }}>
          <span>{p.stack.slice(0, 5).join(" · ")}</span>
          <span>{PROFILE.name}</span>
        </div>
      </div>
    ),
    size,
  );
}
