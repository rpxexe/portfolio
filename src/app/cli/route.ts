import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";

const WIDTH = 76;
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[38;5;48m",
  cyan: "\x1b[38;5;80m",
  under: "\x1b[4m",
};

function wrap(text: string, indent: number) {
  const pad = " ".repeat(indent);
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && pad.length + line.length + word.length + 1 > WIDTH) {
      lines.push(pad + line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(pad + line);
  return lines.join("\n");
}

const heading = (t: string) => `\n${c.green}${c.bold}${t.toUpperCase()}${c.reset} ${c.dim}${"─".repeat(WIDTH - t.length - 1)}${c.reset}\n`;

function renderCliResume(origin: string) {
  const out: string[] = [];
  out.push(`\n${c.bold}${PROFILE.name}${c.reset}  ${c.dim}@${PROFILE.handle}${c.reset}`);
  out.push(`${c.cyan}${PROFILE.role}${c.reset} · ${PROFILE.location}`);
  out.push(wrap(PROFILE.subhead, 0));

  out.push(heading("Work"));
  for (const p of PROJECTS) {
    out.push(`${c.dim}${String(p.rank).padStart(2, "0")}${c.reset} ${c.bold}${p.name}${c.reset}  ${c.dim}${p.category}${c.reset}`);
    out.push(wrap(p.tagline, 3));
    out.push(`${c.dim}${wrap(p.stack.join(" · "), 3)}${c.reset}`);
    out.push(`   ${c.under}${origin}/work/${p.slug}${c.reset}\n`);
  }

  out.push(heading("Experience"));
  for (const e of PROFILE.experience) {
    out.push(`${c.bold}${e.role}${c.reset}, ${e.organization}  ${c.dim}${e.period}${c.reset}`);
    for (const h of e.highlights) out.push(wrap(`- ${h}`, 2));
  }

  out.push(heading("Skills"));
  for (const s of PROFILE.skills) out.push(`${c.cyan}${s.domain}${c.reset}\n${wrap(s.items.join(", "), 2)}`);

  out.push(heading("Contact"));
  out.push(`email     ${PROFILE.email}`);
  out.push(`github    ${PROFILE.github}`);
  out.push(`linkedin  ${PROFILE.linkedin}`);
  out.push(`resume    ${origin}${PROFILE.resumePdfPath}`);
  out.push(`\n${c.dim}${PROFILE.availability}${c.reset}`);
  out.push(`${c.dim}Open ${origin} in a browser for the full site.${c.reset}\n`);
  return out.join("\n");
}

export function GET(request: Request) {
  return new Response(renderCliResume(new URL(request.url).origin), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
