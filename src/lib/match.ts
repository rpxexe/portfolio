import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";

// Shared by the job-description fit lens, the "ask my work" retriever (client + /api/ask) and the curl resume.

const ALIASES: Record<string, string> = {
  postgres: "postgresql",
  nodejs: "node.js",
  node: "node.js",
  nextjs: "next.js",
  reactjs: "react",
  ts: "typescript",
  js: "javascript",
  mongo: "mongodb",
  threejs: "three.js",
  csharp: "c#",
  electronjs: "electron",
  tailwindcss: "tailwind",
  llm: "llms",
};

export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.toLowerCase().match(/[a-z0-9][a-z0-9.#+-]*/g) ?? []) {
    const t = raw.replace(/[.-]+$/, "");
    if (t) out.push(ALIASES[t] ?? t);
  }
  return out;
}

/* ---------- Job-description fit lens ---------- */

// Words that appear in stack labels but say nothing about a skill on their own
const VOCAB_STOP = new Set([
  "api", "sdk", "code", "query", "table", "better", "interpreter", "orm", "wal", "database", "validation",
  "functional", "smoke", "sanity", "and", "dtls-srtp", "sendinput", "native", "backend", "ui", "/",
]);

export interface FitItem {
  name: string;
  kind: "project" | "role";
  href: string;
  stack: string[];
  lines: string[];
}

export const FIT_ITEMS: FitItem[] = [
  ...PROJECTS.map((p) => ({
    name: p.name,
    kind: "project" as const,
    href: `/work/${p.slug}`,
    stack: p.stack,
    lines: [p.summary, p.architectureSummary, ...p.highlights],
  })),
  ...PROFILE.experience.map((e) => ({
    name: `${e.role}, ${e.organization}`,
    kind: "role" as const,
    href: "/resume",
    stack: e.stack,
    lines: e.highlights,
  })),
];

export const SKILL_VOCAB = new Set(
  [...FIT_ITEMS.flatMap((i) => i.stack), ...PROFILE.skills.flatMap((s) => s.items)]
    .flatMap(tokenize)
    .filter((t) => !VOCAB_STOP.has(t) && !/^\d+$/.test(t) && t.length > 1),
);

export interface FitResult {
  item: FitItem;
  matched: { term: string; evidence: string; inStack: boolean }[];
  score: number;
}

export function fitRank(jobDescription: string) {
  const wanted = [...new Set(tokenize(jobDescription).filter((t) => SKILL_VOCAB.has(t)))];
  const results: FitResult[] = FIT_ITEMS.map((item) => {
    const matched = wanted.flatMap((term) => {
      const stackHit = item.stack.find((s) => tokenize(s).includes(term));
      const lineHit = stackHit ? undefined : item.lines.find((l) => tokenize(l).includes(term));
      const evidence = stackHit ?? lineHit;
      return evidence ? [{ term, evidence, inStack: Boolean(stackHit) }] : [];
    });
    // Stack hits are deliberate choices; prose mentions count for less
    const score = matched.reduce((s, m) => s + (m.inStack ? 2 : 1), 0);
    return { item, matched, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const covered = new Set(results.flatMap((r) => r.matched.map((m) => m.term)));
  return { wanted, covered, results };
}

/* ---------- "Ask my work" retrieval ---------- */

export interface Chunk {
  id: number;
  label: string;
  href: string;
  text: string;
}

const QUESTION_STOP = new Set(
  "a an and are as at be by can could did do does for from has have he his how i in is it its me my of on or rishabh risu so that the their them they this to was what when where which who why will with work works worked you your about any tell built build".split(
    " ",
  ),
);

export const CHUNKS: Chunk[] = (() => {
  const raw: Omit<Chunk, "id">[] = [];
  for (const p of PROJECTS) {
    const href = `/work/${p.slug}`;
    const label = p.name;
    raw.push({ label, href, text: `${p.name}: ${p.tagline}. ${p.summary}` });
    raw.push({ label, href, text: `${p.name} problem: ${p.problem}` });
    raw.push({ label, href, text: `${p.name} architecture: ${p.architectureSummary}` });
    raw.push({ label, href, text: `${p.name} stack: ${p.stack.join(", ")}. Focus: ${p.complexityFocus}.` });
    for (const h of p.highlights) raw.push({ label, href, text: `${p.name}: ${h}` });
  }
  raw.push({ label: "Profile", href: "/resume", text: `${PROFILE.subhead} ${PROFILE.summary}` });
  raw.push({ label: "Availability", href: "/contact", text: `${PROFILE.availability} Based in ${PROFILE.location}.` });
  for (const e of PROFILE.experience) {
    for (const h of e.highlights) raw.push({ label: e.organization, href: "/resume", text: `${e.role} at ${e.organization} (${e.period}): ${h}` });
  }
  for (const s of PROFILE.skills) raw.push({ label: "Skills", href: "/resume", text: `${s.domain}: ${s.summary} ${s.items.join(", ")}.` });
  for (const ed of PROFILE.education) raw.push({ label: "Education", href: "/resume", text: `${ed.degree}, ${ed.institution}, ${ed.period}, ${ed.score}.` });
  return raw.map((c, id) => ({ ...c, id }));
})();

const CHUNK_TOKENS = CHUNKS.map((c) => new Set(tokenize(c.text)));
const DF = new Map<string, number>();
for (const set of CHUNK_TOKENS) for (const t of set) DF.set(t, (DF.get(t) ?? 0) + 1);

/** Rank chunks by summed IDF of question terms they contain (tiny BM25 without length norm). */
export function retrieve(question: string, k = 6): (Chunk & { score: number })[] {
  const terms = [...new Set(tokenize(question).filter((t) => !QUESTION_STOP.has(t)))];
  const n = CHUNKS.length;
  return CHUNKS.map((c, i) => ({
    ...c,
    score: terms.reduce((s, t) => (CHUNK_TOKENS[i].has(t) ? s + Math.log(1 + n / (DF.get(t) ?? n)) : s), 0),
  }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
