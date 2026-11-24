"use client";

import { useState } from "react";
import { PROFILE } from "@/data/profile";

export interface HistoryCommit {
  hash: string;
  date: string;
  subject: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  files: { path: string; add: number; del: number }[];
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function TimeMachine({ commits }: { commits: HistoryCommit[] }) {
  const [index, setIndex] = useState(commits.length - 1);
  const c = commits[index];
  if (!c) return <p className="text-sm text-muted">No history snapshot yet. Run `bun run history`.</p>;

  const maxChurn = Math.max(...commits.map((x) => x.additions + x.deletions));
  const netLines = commits.slice(0, index + 1).reduce((s, x) => s + x.additions - x.deletions, 0);
  const maxFile = Math.max(...c.files.map((f) => f.add + f.del), 1);
  const repo = PROFILE.sourceRepo;

  return (
    <div data-src="src/components/TimeMachine.tsx" className="flex flex-col gap-8">
      {/* Churn per commit; each bar is also a jump target */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-1 h-28" role="group" aria-label="Lines changed per version">
          {commits.map((x, i) => (
            <button
              key={x.hash}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Version ${i + 1}: ${x.subject}`}
              aria-pressed={i === index}
              className="flex-1 min-w-2 rounded-t-sm bg-rule-2 hover:bg-cool aria-pressed:bg-accent transition-colors"
              style={{ height: `${Math.max(6, ((x.additions + x.deletions) / maxChurn) * 100)}%` }}
            />
          ))}
        </div>
        <label htmlFor="tm-range" className="sr-only">
          Scrub through versions
        </label>
        <input
          id="tm-range"
          type="range"
          min={0}
          max={commits.length - 1}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
        <div className="flex justify-between text-xs text-muted measured">
          <span>{dateFmt.format(new Date(commits[0].date))}</span>
          <span>{dateFmt.format(new Date(commits[commits.length - 1].date))}</span>
        </div>
      </div>

      <article className="grid gap-8 lg:grid-cols-[1fr_1.2fr] border-t border-rule pt-8" aria-live="polite">
        <div className="flex flex-col gap-3">
          <span className="measured text-accent">
            v{index + 1} of {commits.length} · {dateFmt.format(new Date(c.date))}
          </span>
          <h2 className="text-2xl font-medium text-ink">{c.subject}</h2>
          <dl className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <dt className="text-xs text-muted">added</dt>
              <dd className="text-xl text-ok">+{c.additions.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">removed</dt>
              <dd className="text-xl text-bad">−{c.deletions.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">files</dt>
              <dd className="text-xl text-ink">{c.filesChanged}</dd>
            </div>
          </dl>
          <p className="text-sm text-ink-2">
            Codebase at this point: about <span className="text-ink">{netLines.toLocaleString()}</span> lines, not counting lockfiles.
          </p>
          <a href={`${repo}/commit/${c.hash}`} target="_blank" rel="noopener noreferrer" className="text-link text-sm measured w-fit">
            {c.hash.slice(0, 7)} on GitHub ↗
          </a>
        </div>

        <ul className="flex flex-col gap-2" aria-label="Biggest file changes">
          {c.files.map((f) => (
            <li key={f.path} className="grid grid-cols-[1fr_auto] gap-3 items-center text-xs">
              <span className="measured text-ink-2 truncate" title={f.path}>
                {f.path}
              </span>
              <span className="measured text-muted">
                <span className="text-ok">+{f.add}</span> <span className="text-bad">−{f.del}</span>
              </span>
              <span className="col-span-2 flex h-1 rounded-full overflow-hidden bg-rule">
                <span className="bg-ok" style={{ width: `${(f.add / maxFile) * 100}%` }} />
                <span className="bg-bad" style={{ width: `${(f.del / maxFile) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </article>

      <p className="text-sm text-muted border-t border-rule pt-6">
        Before v1 there was a static GitHub Pages site.{" "}
        <a href={PROFILE.legacyPortfolio} target="_blank" rel="noopener noreferrer" className="text-link">
          Visit v0 ↗
        </a>
      </p>
    </div>
  );
}
