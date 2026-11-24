"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 404 styled as a native stop screen. 0x194 is 404 in hex.
export function CrashScreen() {
  const path = usePathname();
  const [dump, setDump] = useState(0);

  useEffect(() => {
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const iv = window.setInterval(() => {
      setDump((d) => {
        const next = instant ? 100 : Math.min(100, d + Math.ceil(Math.random() * 9));
        if (next >= 100) window.clearInterval(iv);
        return next;
      });
    }, 90);
    return () => window.clearInterval(iv);
  }, []);

  return (
    <section
      data-src="src/components/CrashScreen.tsx"
      aria-labelledby="crash-heading"
      className="min-h-[85vh] flex items-center bg-[oklch(42%_0.16_258)] text-[oklch(97%_0.01_258)] py-24"
    >
      <div className="container flex flex-col gap-8 max-w-4xl">
        <p className="measured text-sm opacity-80">STOP 0x00000194</p>
        <h1 id="crash-heading" className="text-4xl sm:text-6xl font-medium tracking-tight leading-tight">
          risu.exe tried to load a route that doesn&apos;t exist, and stopped.
        </h1>
        <p className="text-lg opacity-90" aria-live="off">
          Writing crash dump… {dump}% complete
        </p>

        <dl className="measured text-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 opacity-90">
          <dt className="opacity-70">Stop code</dt>
          <dd>ROUTE_NOT_FOUND</dd>
          <dt className="opacity-70">Faulting route</dt>
          <dd className="break-all">{path}</dd>
          <dt className="opacity-70">What failed</dt>
          <dd>app-router!resolveSegment</dd>
          <dt className="opacity-70">HTTP status</dt>
          <dd>404</dd>
        </dl>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/" className="border border-current rounded-[var(--radius-pill)] px-5 py-2.5 text-sm hover:bg-white/10">
            Restart at home
          </Link>
          <Link href="/work" className="border border-current rounded-[var(--radius-pill)] px-5 py-2.5 text-sm hover:bg-white/10">
            Open the work index
          </Link>
        </div>
      </div>
    </section>
  );
}
