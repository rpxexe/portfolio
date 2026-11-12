"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { PROFILE } from "@/data/profile";

const NAV_ITEMS = [
  { href: "/work", label: "Work" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

const DRAWER_LINKS = [
  { index: "01", href: "/#introduction", label: "Introduction" },
  { index: "02", href: "/#work-index", label: "Selected Systems" },
  { index: "03", href: "/#principles", label: "Architecture Principles" },
  { index: "04", href: "/#experience", label: "Experience & Figures" },
  { index: "05", href: "/#faq", label: "Questions" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const drawer = drawerRef.current;
    if (drawer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const ctx = gsap.context(() => {
        gsap.fromTo(drawer, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: "power2.out" });
        gsap.fromTo(
          "[data-drawer-item]",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power3.out", clearProps: "transform,opacity" }
        );
      }, drawer);
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        ctx.revert();
      };
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header className="site-nav no-print">
        <div className="container site-nav__inner">
          <Link
            href="/"
            className="site-nav__brand"
            aria-label={`${PROFILE.name} home`}
            onClick={() => setMenuOpen(false)}
          >
            <span>Rishabh</span>
            <span className="brand-serif">Vishwakarma</span>
          </Link>

          <a
            href={`mailto:${PROFILE.email}`}
            className="hidden lg:inline-block measured text-muted hover:text-accent transition-colors"
          >
            {PROFILE.email}
          </a>

          <div className="flex items-center gap-6">
            <nav className="site-nav__links hidden md:flex" aria-label="Primary navigation">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/work"
                    ? pathname.startsWith("/work")
                    : pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="site-nav__link"
                    data-active={active ? "true" : "false"}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              className="nav-orb"
              aria-expanded={menuOpen}
              aria-controls="editorial-nav-drawer"
              aria-label={menuOpen ? "Close section index" : "Open section index"}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={18} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={18} strokeWidth={1.75} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="editorial-nav-drawer"
          ref={drawerRef}
          className="nav-drawer no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation index"
        >
          <div className="container flex items-center justify-between">
            <span className="measured text-muted">Section index, Mumbai IST</span>
            <button
              type="button"
              className="nav-orb"
              aria-label="Close navigation index"
              onClick={() => setMenuOpen(false)}
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <nav className="container my-auto flex flex-col" aria-label="Section links">
            {DRAWER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-drawer-item
                className="nav-drawer__link"
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex items-baseline gap-6">
                  <span className="measured text-accent">{item.index}</span>
                  <span>{item.label}</span>
                </span>
                <ArrowUpRight size={20} strokeWidth={1.5} className="text-muted shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </nav>

          <div className="container pt-6 border-t border-rule flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/work" className="text-link" onClick={() => setMenuOpen(false)}>
                All 8 projects
              </Link>
              <Link href="/resume" className="text-link" onClick={() => setMenuOpen(false)}>
                Resume
              </Link>
              <Link href="/contact" className="text-link" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
            </div>
            <a
              href={`mailto:${PROFILE.email}`}
              className="bracket-btn"
              onClick={() => setMenuOpen(false)}
            >
              Email me
            </a>
          </div>
        </div>
      )}
    </>
  );
}
