"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, X } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";
import { INTRO_COVERED_EVENT, INTRO_DONE_EVENT } from "@/components/PageLoader";
import { PROFILE } from "@/data/profile";

gsap.registerPlugin(ScrollTrigger);

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
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const progress = progressRef.current;
    if (!header) return;

    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let active = true;

      const getNavItems = () => header.querySelectorAll("[data-nav-reveal]");

      const prepareNavReveal = () => {
        if (!active) return;
        const els = getNavItems();
        if (els.length) gsap.set(els, { y: -12, opacity: 0 });
      };

      const playNavReveal = () => {
        if (!active) return;
        const els = getNavItems();
        if (!els.length) return;
        gsap.fromTo(
          els,
          { y: -12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.055,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      };

      const overlayExists = Boolean(document.querySelector(".intro-overlay"));
      if (overlayExists) {
        window.addEventListener(INTRO_COVERED_EVENT, prepareNavReveal, { once: true });
        window.addEventListener(INTRO_DONE_EVENT, playNavReveal, { once: true });
      } else {
        playNavReveal();
      }

      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: () => ScrollTrigger.maxScroll(window) || document.documentElement.scrollHeight - window.innerHeight,
            scrub: 0.15,
            invalidateOnRefresh: true,
          },
        });
      }

      return () => {
        active = false;
        window.removeEventListener(INTRO_COVERED_EVENT, prepareNavReveal);
        window.removeEventListener(INTRO_DONE_EVENT, playNavReveal);
      };
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      mm.revert();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const drawer = drawerRef.current;
    if (drawer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          drawer,
          { clipPath: "inset(0% 0% 100% 0%)", opacity: 0.9 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 0.42,
            ease: "power4.inOut",
            clearProps: "clipPath,opacity",
          }
        );
        gsap.fromTo(
          drawer.querySelectorAll("[data-drawer-item]"),
          { y: 26, skewY: 1.5, opacity: 0 },
          {
            y: 0,
            skewY: 0,
            opacity: 1,
            duration: 0.44,
            delay: 0.1,
            stagger: 0.045,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
        gsap.fromTo(
          drawer.querySelectorAll("[data-drawer-chrome]"),
          { y: -10, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.34,
            delay: 0.08,
            stagger: 0.05,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }, drawer);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", onKeyDown);
        ctx.revert();
      };
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header ref={headerRef} className="site-nav no-print" data-scrolled={scrolled ? "true" : "false"}>
        <div className="container site-nav__inner">
          <Link
            href="/"
            data-nav-reveal
            className="site-nav__brand"
            aria-label={`${PROFILE.name} home`}
            onClick={() => setMenuOpen(false)}
          >
            <span>Rishabh</span>
            <span className="brand-serif">Vishwakarma</span>
          </Link>

          <a
            href={`mailto:${PROFILE.email}`}
            data-nav-reveal
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
                    data-nav-reveal
                    className="site-nav__link"
                    data-active={active ? "true" : "false"}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Magnetic strength={4}>
              <button
                type="button"
                data-nav-reveal
                className="nav-orb"
                aria-expanded={menuOpen}
                aria-controls="editorial-nav-drawer"
                aria-label={menuOpen ? "Close section index" : "Open section index"}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <span className="nav-orb__glyph" aria-hidden="true">
                  <span className="nav-orb__bar" />
                  <span className="nav-orb__bar" />
                  <span className="nav-orb__bar" />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
        <span ref={progressRef} className="site-nav__progress" aria-hidden="true" />
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
          <div className="border-b border-rule">
            <div className="container site-nav__inner">
              <span data-drawer-chrome className="measured text-muted">
                Section index, Mumbai IST
              </span>
              <Magnetic strength={4}>
                <button
                  type="button"
                  data-drawer-chrome
                  className="nav-orb"
                  aria-label="Close navigation index"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </Magnetic>
            </div>
          </div>

          <nav className="container my-auto py-8 flex flex-col w-full" aria-label="Section links">
            {DRAWER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-drawer-item
                className="nav-drawer__link"
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-drawer__label flex items-baseline gap-6">
                  <span className="measured text-accent">{item.index}</span>
                  <span>{item.label}</span>
                </span>
                <ArrowUpRight
                  size={20}
                  strokeWidth={1.5}
                  className="nav-drawer__arrow text-muted shrink-0"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>

          <div className="border-t border-rule">
            <div className="container py-6 flex flex-wrap items-center justify-between gap-4">
              <div data-drawer-chrome className="flex flex-wrap gap-6 text-sm">
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
                data-drawer-chrome
                className="bracket-btn"
                onClick={() => setMenuOpen(false)}
              >
                Email me
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
