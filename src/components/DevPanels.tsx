"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import { PROFILE } from "@/data/profile";

type Panel = "monitor" | "source" | "help";
const EVENT = "devpanel:toggle";
const KEYS: Record<string, Panel> = { "`": "monitor", "\\": "source", "?": "help" };
const CLOSED: Record<Panel, boolean> = { monitor: false, source: false, help: false };

export const toggleDevPanel = (panel: Panel) => window.dispatchEvent(new CustomEvent<Panel>(EVENT, { detail: panel }));

/** Footer buttons, so touch devices without a keyboard can open the panels too. */
export function DevToggle({ panel, children }: { panel: Panel; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => toggleDevPanel(panel)} className="text-link text-xs">
      {children}
    </button>
  );
}

export function DevPanels() {
  const [open, setOpen] = useState<Record<Panel, boolean>>(CLOSED);

  useEffect(() => {
    const flip = (p: Panel) => setOpen((o) => ({ ...o, [p]: !o[p] }));
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || el?.closest("input, textarea, select, [contenteditable='true']")) return;
      const panel = KEYS[e.key];
      if (panel) flip(panel);
      else if (e.key === "Escape") setOpen(CLOSED);
    };
    const onToggle = (e: Event) => flip((e as CustomEvent<Panel>).detail);
    window.addEventListener("keydown", onKey);
    window.addEventListener(EVENT, onToggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EVENT, onToggle);
    };
  }, []);

  return (
    <>
      {open.monitor && <SysMonitor onClose={() => setOpen((o) => ({ ...o, monitor: false }))} />}
      {open.source && <SourceReveal onClose={() => setOpen((o) => ({ ...o, source: false }))} />}
      {open.help && <ShortcutSheet onClose={() => setOpen((o) => ({ ...o, help: false }))} />}
    </>
  );
}

/* ---------- "?" sheet: the only place the hidden keys are listed ---------- */

const SHORTCUTS: [string, string][] = [
  ["`", "Task manager: live frame rate, memory and network for this tab"],
  ["\\", "Source view: label each section with the file that renders it"],
  ["?", "This sheet"],
  ["Esc", "Close everything"],
];

function ShortcutSheet({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  // Rendered only after a key press or click, so window is always defined here
  const curl = `curl ${window.location.origin}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(curl);
      setCopied(true);
    } catch {
      // Clipboard blocked: the command stays visible to copy by hand
    }
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center bg-paper-3/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-title"
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg flex flex-col gap-5 border border-rule-2 rounded-[var(--radius-card)] bg-paper-2 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="shortcut-title" className="text-xl font-medium text-ink">
            Hidden controls
          </h2>
          <button type="button" onClick={onClose} aria-label="Close shortcuts" className="text-muted hover:text-ink" autoFocus>
            <X size={16} />
          </button>
        </div>

        <dl className="flex flex-col gap-3">
          {SHORTCUTS.map(([key, what]) => (
            <div key={key} className="grid grid-cols-[3.5rem_1fr] items-baseline gap-3 text-sm">
              <dt>
                <kbd className="measured inline-block min-w-8 text-center border border-rule-2 rounded px-2 py-0.5 text-ink">{key}</kbd>
              </dt>
              <dd className="text-ink-2">{what}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-2 border-t border-rule pt-4">
          <span className="text-sm text-ink-2">From a terminal, this site prints a text resume:</span>
          <button
            type="button"
            onClick={copy}
            className="measured text-left text-sm bg-paper border border-rule rounded px-3 py-2 text-accent hover:border-accent"
          >
            $ {curl}
            <span className="float-right text-muted">{copied ? "copied" : "copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Task Manager for this tab ---------- */

interface Stats {
  fps: number;
  heapMb: number | null;
  heapLimitMb: number | null;
  dom: number;
  longTasks: number;
  blockingMs: number;
  requests: number;
  kb: number;
  loadMs: number | null;
  triggers: number;
  fpsHistory: number[];
}

type ChromePerformance = Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };

function SysMonitor({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    let frames = 0;
    let raf = 0;
    const loop = () => {
      frames++;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let longTasks = 0;
    let blockingMs = 0;
    let po: PerformanceObserver | undefined;
    try {
      po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          longTasks++;
          blockingMs += e.duration - 50; // TBT counts only the part past 50 ms
        }
      });
      po.observe({ type: "longtask", buffered: true });
    } catch {
      // Safari and Firefox have no longtask entries
    }

    const tick = () => {
      const mem = (performance as ChromePerformance).memory;
      const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const bytes = res.reduce((sum, r) => sum + r.transferSize, 0) + (nav?.transferSize ?? 0);
      const fps = frames;
      frames = 0;
      setS((prev) => ({
        fps,
        heapMb: mem ? mem.usedJSHeapSize / 1048576 : null,
        heapLimitMb: mem ? mem.jsHeapSizeLimit / 1048576 : null,
        dom: document.getElementsByTagName("*").length,
        longTasks,
        blockingMs,
        requests: res.length + 1,
        kb: bytes / 1024,
        loadMs: nav && nav.loadEventEnd > 0 ? nav.loadEventEnd - nav.startTime : null,
        triggers: ScrollTrigger.getAll().length,
        fpsHistory: [...(prev?.fpsHistory ?? []), fps].slice(-40),
      }));
    };
    const iv = window.setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
      po?.disconnect();
    };
  }, []);

  const rows: [string, string][] = s
    ? [
        ["Frame rate", `${s.fps} fps`],
        ["JS heap", s.heapMb === null ? "n/a in this browser" : `${s.heapMb.toFixed(1)} / ${s.heapLimitMb!.toFixed(0)} MB`],
        ["DOM nodes", s.dom.toLocaleString()],
        ["Long tasks", s.longTasks ? `${s.longTasks} (${Math.round(s.blockingMs)} ms blocking)` : "0"],
        ["Requests", `${s.requests}, ${s.kb.toFixed(0)} KB over the wire`],
        ["Page load", s.loadMs === null ? "loading…" : `${Math.round(s.loadMs)} ms`],
        ["Scroll triggers", String(s.triggers)],
      ]
    : [];
  const hist = s?.fpsHistory ?? [];
  const points = hist.map((v, i) => `${(i / 39) * 200},${40 - (Math.min(v, 120) / 120) * 38}`).join(" ");

  return (
    <aside
      data-lenis-prevent
      aria-label="Live page metrics"
      className="fixed bottom-4 right-4 z-[var(--z-toast)] w-[min(22rem,calc(100vw-2rem))] border border-rule-2 rounded-[var(--radius-card)] bg-paper-3/95 backdrop-blur text-xs shadow-2xl"
    >
      <header className="flex items-center justify-between border-b border-rule px-3 py-2">
        <span className="measured text-ink">Task Manager · risu.exe</span>
        <button type="button" onClick={onClose} aria-label="Close metrics" className="text-muted hover:text-ink">
          <X size={14} />
        </button>
      </header>
      <div className="p-3 flex flex-col gap-3">
        <svg viewBox="0 0 200 40" className="w-full h-10" role="img" aria-label="Frame rate over the last 40 seconds">
          <line x1="0" y1={40 - (60 / 120) * 38} x2="200" y2={40 - (60 / 120) * 38} className="stroke-rule-2" strokeDasharray="3 3" />
          {hist.length > 1 && <polyline points={points} fill="none" className="stroke-accent" strokeWidth="1.5" />}
        </svg>
        {s ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="measured text-ink-2 text-right">{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-muted">Sampling…</p>
        )}
        <p className="text-muted border-t border-rule pt-2">
          Live numbers from this tab. Press <kbd className="measured text-ink">`</kbd> to close.
        </p>
      </div>
    </aside>
  );
}

/* ---------- Source reveal: label every tagged section with the file that renders it ---------- */

interface Box {
  path: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

function SourceReveal({ onClose }: { onClose: () => void }) {
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    let raf = 0;
    // Re-measure every frame while open: smooth scroll and GSAP pins move sections constantly
    const measure = () => {
      const next: Box[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("[data-src]")) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || r.width === 0) continue;
        next.push({ path: el.dataset.src!, top: r.top, left: r.left, width: r.width, height: r.height });
      }
      setBoxes((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-[var(--z-toast)] pointer-events-none" aria-label="Source map overlay">
      {boxes.map((b, i) => (
        <div
          key={`${b.path}-${i}`}
          className="absolute border border-dashed border-cool/70"
          style={{ top: b.top, left: b.left, width: b.width, height: b.height }}
        >
          <a
            href={`${PROFILE.sourceRepo}/blob/main/${b.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto absolute left-2 measured text-[11px] bg-cool text-paper-3 px-2 py-0.5 rounded-sm hover:bg-accent"
            style={{ top: Math.max(0, 72 - b.top) + 8 }}
          >
            {b.path} ↗
          </a>
        </div>
      ))}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-paper-3 border border-rule-2 rounded-[var(--radius-pill)] px-4 py-2 text-xs text-ink-2">
        <span>Source view: click a label to open that file on GitHub</span>
        <button type="button" onClick={onClose} aria-label="Close source view" className="text-muted hover:text-ink">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
