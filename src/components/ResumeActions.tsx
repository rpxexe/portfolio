"use client";

import { Download, Printer } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";
import { PROFILE } from "@/data/profile";

export function ResumeActions() {
  return (
    <div className="flex flex-wrap items-center gap-3 no-print">
      <Magnetic>
        <a href={PROFILE.resumePdfPath} download="Rishabh-Vishwakarma-Resume.pdf" className="btn btn--primary">
          <Download size={16} strokeWidth={1.75} aria-hidden="true" />
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
