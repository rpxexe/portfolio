"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CHUNKS, retrieve, tokenize, type Chunk } from "@/lib/match";

type Phase = "idle" | "query" | "retrieve" | "generate" | "done" | "error";
type Source = Chunk & { score: number };

const SUGGESTIONS = [
  "What has he built with WebRTC?",
  "How does he run long AI jobs?",
  "Has he shipped PostgreSQL in production?",
];
const ORDER: Phase[] = ["query", "retrieve", "generate", "done"];
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AskWork() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [terms, setTerms] = useState<string[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState("");
  const [ms, setMs] = useState<{ retrieve?: number; generate?: number }>({});
  const [model, setModel] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim() || (phase !== "idle" && phase !== "done" && phase !== "error")) return;
    setQuestion(q);
    setAnswer("");
    setNote("");
    setSources([]);
    setMs({});
    setModel(null);

    setPhase("query");
    setTerms([...new Set(tokenize(q))]);
    await pause(260);

    setPhase("retrieve");
    const t0 = performance.now();
    const local = retrieve(q);
    setMs({ retrieve: performance.now() - t0 });
    setSources(local);
    await pause(260);

    setPhase("generate");
    const t1 = performance.now();
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = (await res.json()) as { answer?: string; error?: string; sources?: Source[]; model?: string | null };
      setMs((m) => ({ ...m, generate: performance.now() - t1 }));
      if (data.sources) setSources(data.sources);
      setModel(data.model ?? null);
      if (data.answer) {
        setAnswer(data.answer);
        setPhase("done");
      } else {
        setNote(data.error ?? "Something went wrong.");
        setPhase("error");
      }
    } catch {
      setNote("Network error. Showing the matching sources instead.");
      setPhase("error");
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(question);
  }

  const reached = (p: Phase) =>
    phase === "error" ? p !== "done" : ORDER.indexOf(phase) >= ORDER.indexOf(p) && phase !== "idle";
  const active = (p: Phase) => phase === p && p !== "done"; // the answer node is an end state, not a running stage

  const nodes: { id: Phase; label: string; detail: string }[] = [
    { id: "query", label: "query", detail: terms.length ? terms.slice(0, 6).join(" · ") : "tokenize question" },
    {
      id: "retrieve",
      label: "retrieve",
      detail: ms.retrieve !== undefined ? `${CHUNKS.length} chunks → top ${sources.length}, ${ms.retrieve.toFixed(1)} ms` : `${CHUNKS.length} chunks, IDF rank`,
    },
    {
      id: "generate",
      label: "generate",
      detail:
        ms.generate !== undefined ? `${model ?? "no model"}, ${Math.round(ms.generate)} ms` : phase === "generate" ? "waiting on Gemini…" : "Gemini, cited",
    },
    { id: "done", label: "answer", detail: phase === "error" ? "fell back to sources" : "with citations" },
  ];

  return (
    <div data-src="src/components/AskWork.tsx" data-reveal className="flex flex-col gap-6 border border-rule rounded-[var(--radius-card)] bg-paper-2 p-5 sm:p-8">
      <div className="flex flex-col gap-1">
        <span className="measured text-accent">ask.my_work</span>
        <h3 className="text-2xl font-medium text-ink">Ask about my work, watch the pipeline answer</h3>
        <p className="text-sm text-muted">Answers come only from my case studies and resume, and every claim links to its source.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="ask-q" className="sr-only">
          Question about Rishabh&apos;s work
        </label>
        <input
          id="ask-q"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={300}
          placeholder="e.g. Has he built anything with Win32?"
          className="flex-1 bg-paper border border-rule-2 rounded-[var(--radius-card)] px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-focus"
        />
        <button type="submit" className="btn btn--primary" disabled={phase === "query" || phase === "retrieve" || phase === "generate"}>
          Ask
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="text-xs text-ink-2 border border-rule rounded-[var(--radius-pill)] px-3 py-1.5 hover:border-accent hover:text-accent">
            {s}
          </button>
        ))}
      </div>

      {/* The DAG: each node lights when its stage runs, with its real timing */}
      <ol data-reveal-stagger className="grid grid-cols-1 sm:grid-cols-4 gap-2" aria-label="Answer pipeline">
        {nodes.map((n, i) => (
          <li
            key={n.id}
            data-reached={reached(n.id)}
            data-active={active(n.id)}
            className="ask-node flex flex-col gap-1 border border-rule rounded-[var(--radius-card)] p-3 data-[reached=true]:border-accent data-[reached=true]:bg-accent-soft"
          >
            <span className="measured text-xs text-muted">
              {String(i + 1).padStart(2, "0")} {n.label}
            </span>
            <span className="text-xs text-ink-2 break-words">{n.detail}</span>
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="flex flex-col gap-4">
        {answer && (
          <p className="ask-in text-base text-ink leading-relaxed">
            {answer.split(/(\[\d+\])/).map((part, i) => {
              const m = part.match(/^\[(\d+)\]$/);
              const src = m ? sources[Number(m[1]) - 1] : undefined;
              return src ? (
                <Link key={i} href={src.href} className="text-accent text-xs align-super mx-0.5 hover:underline" title={src.text}>
                  [{m![1]}]
                </Link>
              ) : (
                <span key={i}>{part}</span>
              );
            })}
          </p>
        )}
        {note && <p className="ask-in text-sm text-muted">{note}</p>}

        {sources.length > 0 && (phase === "done" || phase === "error") && (
          <ol className="flex flex-col gap-2 border-t border-rule pt-4">
            {sources.map((s, i) => (
              <li key={s.id} className="ask-in text-xs text-ink-2 flex gap-2" style={{ "--i": i + 2 } as React.CSSProperties}>
                <span className="measured text-accent shrink-0">[{i + 1}]</span>
                <span>
                  <Link href={s.href} className="text-link">
                    {s.label}
                  </Link>{" "}
                  {s.text}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
