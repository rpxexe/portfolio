import type { ArchitectureNode } from "@/data/projects";

/** Zig-zag SVG pipeline of a project's architecture with streaming packets. */
export function ArchDiagram({ nodes }: { nodes: ArchitectureNode[] }) {
  const W = 360;
  const NW = 150;
  const NH = 44;
  const pos = nodes.slice(0, 4).map((n, i) => ({ n, x: i % 2 === 0 ? 8 : W - NW - 8, y: 12 + i * 58 }));
  const edges = pos.slice(0, -1).map((a, i) => {
    const b = pos[i + 1];
    const fromRight = a.x < b.x;
    const x1 = fromRight ? a.x + NW : a.x;
    const x2 = fromRight ? b.x : b.x + NW;
    const y1 = a.y + NH / 2;
    const y2 = b.y + NH / 2;
    const mx = (x1 + x2) / 2;
    return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  });
  const H = 12 + pos.length * 58;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="arch" role="img" aria-label={`Architecture: ${nodes.map((n) => n.label).join(" → ")}`}>
      {edges.map((d, i) => (
        <g key={d}>
          <path d={d} className="arch__edge" />
          <path d={d} className="arch__flow" style={{ animationDelay: `${-i * 0.5}s` }} />
        </g>
      ))}
      {pos.map(({ n, x, y }, i) => (
        <g key={n.id} className={`arch__node${n.layer === "person" ? " arch__node--person" : ""}`} style={{ animationDelay: `${i * 0.6}s` }}>
          <rect x={x} y={y} width={NW} height={NH} rx={9} />
          <text x={x + 12} y={y + 19} className="arch__label">{n.label}</text>
          <text x={x + 12} y={y + 33} className="arch__role">{`0${i + 1} · ${n.role}`}</text>
        </g>
      ))}
    </svg>
  );
}
