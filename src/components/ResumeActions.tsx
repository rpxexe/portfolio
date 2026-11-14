"use client";

import { Printer } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";
import { PROFILE } from "@/data/profile";

/** Download glyph: the arrow drops into the tray and re-enters from the top on hover. */
function DownloadGlyph() {
  return (
    <svg className="dl-glyph" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g className="dl-glyph__arrow">
        <path d="M10 3v9" />
        <path d="M6.5 8.5L10 12l3.5-3.5" />
      </g>
      <path d="M3.5 13.5v2a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-2" className="dl-glyph__tray" />
    </svg>
  );
}

export function ResumeActions() {
  return (
    <div className="flex flex-wrap items-center gap-3 no-print">
      <Magnetic>
        <a href={PROFILE.resumePdfPath} download="Rishabh-Vishwakarma-Resume.pdf" className="btn btn--primary dl-btn">
          <DownloadGlyph />
          <span>Download PDF</span>
        </a>
      </Magnetic>
      <button type="button" onClick={() => window.print()} className="btn">
        <Printer size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>Print page</span>
      </button>
    </div>
  );
}
