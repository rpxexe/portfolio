"use client";

import { useState } from "react";
import Link from "next/link";
import { fitRank } from "@/lib/match";

const MAX_JD = 8000;

export function FitLens() {
  const [jd, setJd] = useState("");
  const { wanted, covered, results } = fitRank(jd);
  const coverage = wanted.length ? Math.round((covered.size / wanted.length) * 100) : 0;

  return (
    <section data-src="src/components/FitLens.tsx" aria-labelledby="fit-heading" className="flex flex-col gap-6 border border-rule rounded-[var(--radius-card)] bg-paper-2 p-5 sm:p-8">
      <div className="flex flex-col gap-1">
        <span className="measured text-accent">fit.lens</span>
        <h2 id="fit-heading" className="text-2xl font-medium text-ink">
          Hiring? Paste the job description.
        </h2>
        <p className="text-sm text-muted">
          My work gets re-ranked against your stack, with the line that proves each match. It runs in your browser,
          and nothing is sent anywhere.
        </p>
      </div>

      <div className="float-field">
        <div className="float-field__control">
          <textarea
            id="fit-jd"
            rows={4}
            maxLength={MAX_JD}
            placeholder=" "
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            className="float-field__input float-field__input--area"
          />
          <label htmlFor="fit-jd" className="float-field__label">
            Job description or a list of required skills
          </label>
          <span className="float-field__line" aria-hidden="true" />
        </div>
      </div>

      {jd.trim() && wanted.length === 0 && (
        <p className="text-sm text-muted">No stack terms I recognize yet. Try naming technologies, e.g. React, PostgreSQL, Electron.</p>
      )}

      {wanted.length > 0 && (
        <div aria-live="polite" className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-2">
              <span className="text-3xl font-medium text-ink mr-2">{coverage}%</span>
              of the {wanted.length} skills I recognized in the description show up in my shipped work
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Recognized skills">
              {wanted.map((t) => (
                <li
                  key={t}
                  data-hit={covered.has(t)}
                  className="measured text-xs rounded-[var(--radius-pill)] px-2.5 py-1 border border-rule text-muted data-[hit=true]:border-accent data-[hit=true]:text-accent"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <ol className="flex flex-col divide-y divide-rule border-t border-rule">
            {results.map((r, i) => (
              <li key={r.item.name} className="py-4 grid gap-2 sm:grid-cols-[3rem_1fr]">
                <span className="measured text-muted">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <Link href={r.item.href} className="text-lg font-medium text-ink hover:text-accent">
                      {r.item.name}
                    </Link>
                    <span className="measured text-xs text-muted">
                      {r.item.kind} · {r.matched.length} match{r.matched.length === 1 ? "" : "es"}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {r.matched.map((m) => (
                      <li key={m.term} className="text-xs text-ink-2">
                        <span className="measured text-accent mr-2">{m.term}</span>
                        {m.inStack ? `stack: ${m.evidence}` : m.evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
