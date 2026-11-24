import Link from "next/link";
import { PROFILE } from "@/data/profile";
import { DevToggle } from "@/components/DevPanels";

export function Footer() {
  return (
    <footer className="border-t border-rule bg-paper-3 pt-14 pb-10 no-print" data-src="src/components/Footer.tsx">
      <div className="container flex flex-col gap-12">
        <div data-reveal className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-rule">
          <p className="text-sm text-ink-2">
            {PROFILE.name}, {PROFILE.location}
          </p>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-6 text-sm">
            <Link href="/" className="text-link">
              Home
            </Link>
            <Link href="/work" className="text-link">
              Work
            </Link>
            <Link href="/resume" className="text-link">
              Resume
            </Link>
            <Link href="/contact" className="text-link">
              Contact
            </Link>
            <Link href="/changelog" className="text-link">
              Changelog
            </Link>
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="text-link">
              GitHub
            </a>
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
              LinkedIn
            </a>
          </nav>
        </div>

        <div data-reveal className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="measured text-accent">Open to software engineering roles</span>
            <p className="text-3xl sm:text-4xl font-medium text-ink tracking-tight">
              Let&apos;s build something durable
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/contact" className="bracket-btn">
              Start an inquiry
            </Link>
            <a href={`mailto:${PROFILE.email}`} className="text-link text-sm">
              {PROFILE.email}
            </a>
          </div>
        </div>

        <p data-reveal="chars" className="footer-giant pt-4 border-t border-rule" aria-hidden="true">
          GET IN TOUCH
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
          <span>Full-Stack &amp; Systems Engineering Portfolio</span>
          <span className="flex flex-wrap items-center gap-4">
            <DevToggle panel="monitor">
              <kbd className="measured">`</kbd> task manager
            </DevToggle>
            <DevToggle panel="source">
              <kbd className="measured">\</kbd> view source
            </DevToggle>
            <DevToggle panel="help">
              <kbd className="measured">?</kbd> all shortcuts
            </DevToggle>
          </span>
        </div>
      </div>
    </footer>
  );
}
