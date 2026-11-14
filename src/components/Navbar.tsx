"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";
import { RollText } from "@/components/RollText";
import { Logo } from "@/components/Logo";
import { INTRO_COVERED_EVENT, INTRO_DONE_EVENT } from "@/components/PageLoader";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

const MENU_ITEMS = [
  { index: "01", href: "/", label: "Home", note: "Hero, toolbox, principles and FAQ in one scroll." },
  { index: "02", href: "/work", label: "Work", note: `${PROJECTS.length} systems ranked by architectural complexity.` },
  { index: "03", href: "/resume", label: "Resume", note: "Experience, education and skills. Printable and downloadable." },
  { index: "04", href: "/contact", label: "Contact", note: PROFILE.availability },
];

const SECTION_LINKS = [
  { href: "/#introduction", label: "About" },
  { href: "/#work-index", label: "Projects" },
  { href: "/#skills", label: "Toolbox" },
  { href: "/#principles", label: "Principles" },
  { href: "/#experience", label: "Record" },
  { href: "/#faq", label: "FAQ" },
];

// SVG wave states for the menu curtain (same command structure so GSAP can tween `d`)
const WAVE_FLAT = "M0 100 V100 Q50 100 100 100 V100 Z";
const WAVE_BULGE = "M0 100 V55 Q50 -5 100 55 V100 Z";
const WAVE_FULL = "M0 100 V0 Q50 0 100 0 V100 Z";

const isActiveRoute = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

function useIstClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())
        );
      } catch {
        setTime("IST");
      }
    };
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export function Navbar() {
  const pathname = usePathname();
  const time = useIstClock();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(0);

  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  // Mirrors menuMounted so effect cleanups don't revert the timeline mid-reverse
  const menuMountedRef = useRef(false);

  // Scroll state: capsule after 40px, hide on fast downward scroll, reveal on upward
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 320);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intro reveal + scroll progress ring
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let active = true;
      const items = () => header.querySelectorAll("[data-nav-reveal]");
      const prepare = () => active && gsap.set(items(), { y: -16, opacity: 0 });
      const play = () =>
        active &&
        gsap.fromTo(
          items(),
          { y: -16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "expo.out", clearProps: "transform,opacity" }
        );

      if (document.querySelector(".intro-overlay")) {
        window.addEventListener(INTRO_COVERED_EVENT, prepare, { once: true });
        window.addEventListener(INTRO_DONE_EVENT, play, { once: true });
      } else {
        play();
      }

      if (ringRef.current) {
        gsap.fromTo(
          ringRef.current,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              start: 0,
              end: () => ScrollTrigger.maxScroll(window) || document.documentElement.scrollHeight - window.innerHeight,
              scrub: 0.2,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      return () => {
        active = false;
        window.removeEventListener(INTRO_COVERED_EVENT, prepare);
        window.removeEventListener(INTRO_DONE_EVENT, play);
      };
    });
    return () => mm.revert();
  }, []);

  // Sliding pill indicator behind the hovered (or active) nav link
  const moveIndicator = useCallback((target: HTMLElement | null, instant = false) => {
    const pill = indicatorRef.current;
    if (!pill) return;
    if (!target) {
      gsap.to(pill, { opacity: 0, scale: 0.8, duration: 0.25, ease: "power2.out" });
      return;
    }
    gsap.to(pill, {
      x: target.offsetLeft,
      width: target.offsetWidth,
      opacity: 1,
      scale: 1,
      duration: instant ? 0 : 0.55,
      ease: "elastic.out(1, 0.75)",
    });
  }, []);

  const restIndicator = useCallback(
    (instant = false) => {
      const nav = linksRef.current;
      const activeEl = nav?.querySelector<HTMLElement>("[data-active='true']") ?? null;
      moveIndicator(activeEl, instant);
    },
    [moveIndicator]
  );

  useLayoutEffect(() => {
    restIndicator(true);
    const onResize = () => restIndicator(true);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => restIndicator(true));
    return () => window.removeEventListener("resize", onResize);
  }, [pathname, restIndicator]);

  // Menu open / close choreography
  const openMenu = () => {
    setMenuMounted(true);
    setMenuOpen(true);
  };

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    const tl = menuTlRef.current;
    if (tl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tl.timeScale(1.6).reverse();
    } else {
      setMenuMounted(false);
    }
    menuBtnRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!menuMounted || !menuOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onReverseComplete: () => setMenuMounted(false),
      });
      if (reduced) {
        tl.set("[data-wave]", { attr: { d: WAVE_FULL } }).set("[data-menu-fade]", { opacity: 1 });
      } else {
        tl.set(menu, { pointerEvents: "auto" })
          .fromTo("[data-wave='a']", { attr: { d: WAVE_FLAT } }, { attr: { d: WAVE_BULGE }, duration: 0.35, ease: "power2.in" })
          .to("[data-wave='a']", { attr: { d: WAVE_FULL }, duration: 0.35, ease: "power2.out" })
          .fromTo("[data-wave='b']", { attr: { d: WAVE_FLAT } }, { attr: { d: WAVE_BULGE }, duration: 0.35, ease: "power2.in" }, 0.12)
          .to("[data-wave='b']", { attr: { d: WAVE_FULL }, duration: 0.35, ease: "power2.out" }, 0.47)
          .fromTo("[data-menu-fade]", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power3.out" }, 0.55)
          .fromTo(
            "[data-menu-line]",
            { yPercent: 110, rotate: 4 },
            { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.06, ease: "expo.out" },
            0.55
          )
          .fromTo("[data-menu-rule]", { scaleX: 0 }, { scaleX: 1, duration: 0.8, stagger: 0.06, ease: "expo.out" }, 0.6);
      }
      menuTlRef.current = tl;
    }, menu);

    menu.querySelector<HTMLElement>("[data-menu-first]")?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (!menuMountedRef.current) ctx.revert();
    };
  }, [menuMounted, menuOpen, closeMenu]);

  useEffect(() => {
    menuMountedRef.current = menuMounted;
    if (!menuMounted) menuTlRef.current = null;
  }, [menuMounted]);

  const preview = MENU_ITEMS[hoverIdx];

  return (
    <>
      <header
        ref={headerRef}
        className="site-nav no-print"
        data-scrolled={scrolled ? "true" : "false"}
        data-hidden={hidden && !menuOpen ? "true" : "false"}
      >
        <div className="site-nav__shell">
          <Link href="/" data-nav-reveal className="site-nav__brand" aria-label={`${PROFILE.name}, home`}>
            <Logo />
          </Link>

          <nav
            ref={linksRef}
            className="site-nav__links"
            aria-label="Primary navigation"
            onPointerLeave={() => restIndicator()}
          >
            <span ref={indicatorRef} className="site-nav__indicator" aria-hidden="true" />
            {NAV_ITEMS.map((item) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-nav-reveal
                  className="site-nav__link"
                  data-active={active ? "true" : "false"}
                  aria-current={active ? "page" : undefined}
                  onPointerEnter={(e) => moveIndicator(e.currentTarget)}
                  onFocus={(e) => moveIndicator(e.currentTarget)}
                  onBlur={() => restIndicator()}
                >
                  <RollText text={item.label} />
                </Link>
              );
            })}
          </nav>

          <div className="site-nav__right">
            <span data-nav-reveal className="site-nav__status measured">
              <span className="hero-eyebrow__dot" aria-hidden="true" />
              <span className="site-nav__status-text">Mumbai</span>
              <span className="text-ink">{time}</span>
            </span>

            <Magnetic strength={4}>
              <button
                ref={menuBtnRef}
                type="button"
                data-nav-reveal
                className="menu-btn"
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => (menuOpen ? closeMenu() : openMenu())}
              >
                <svg className="menu-btn__ring" viewBox="0 0 48 48" aria-hidden="true">
                  <circle cx="24" cy="24" r="22" className="menu-btn__track" />
                  <circle ref={ringRef} cx="24" cy="24" r="22" pathLength={1} className="menu-btn__progress" />
                </svg>
                <span className="menu-btn__bars" aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {menuMounted && (
        <div
          id="site-menu"
          ref={menuRef}
          className="menu no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          data-lenis-prevent
        >
          <svg className="menu__waves" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path data-wave="a" className="menu__wave menu__wave--a" d={WAVE_FLAT} />
            <path data-wave="b" className="menu__wave menu__wave--b" d={WAVE_FLAT} />
          </svg>

          <div className="menu__inner container">
            <div className="menu__top">
              <span data-menu-fade className="measured text-muted">
                <span className="text-accent">●</span> index / {pathname === "/" ? "home" : pathname.slice(1)}
              </span>
              <button type="button" data-menu-fade className="menu-close" onClick={closeMenu} aria-label="Close menu">
                <span className="measured">close</span>
                <span className="menu-close__x" aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
            </div>

            <div className="menu__grid">
              <nav className="menu__links" aria-label="Pages">
                {MENU_ITEMS.map((item, i) => {
                  const active = isActiveRoute(pathname, item.href);
                  return (
                    <div key={item.href} className="menu__item">
                      <span data-menu-rule className="menu__rule" aria-hidden="true" />
                      <Link
                        href={item.href}
                        data-menu-first={i === 0 ? "" : undefined}
                        className="menu__link"
                        data-active={active ? "true" : "false"}
                        aria-current={active ? "page" : undefined}
                        onPointerEnter={() => setHoverIdx(i)}
                        onFocus={() => setHoverIdx(i)}
                        onClick={closeMenu}
                      >
                        <span className="menu__clip">
                          <span data-menu-line className="menu__line">
                            <span className="menu__index measured">{item.index}</span>
                            <RollText text={item.label} />
                            {active && <span className="menu__here measured">you are here</span>}
                          </span>
                        </span>
                        <ArrowUpRight className="menu__arrow" size={28} strokeWidth={1.25} aria-hidden="true" />
                      </Link>
                    </div>
                  );
                })}
              </nav>

              <aside className="menu__side">
                <div data-menu-fade className="menu__preview" aria-live="polite">
                  <svg className="menu__preview-art" viewBox="0 0 120 60" aria-hidden="true">
                    <path d="M4 50 C 30 50, 30 10, 60 10 S 90 50, 116 50" className="menu__preview-path" pathLength={1} key={hoverIdx} />
                    <circle r="3" className="menu__preview-dot">
                      <animateMotion dur="2.4s" repeatCount="indefinite" path="M4 50 C 30 50, 30 10, 60 10 S 90 50, 116 50" />
                    </circle>
                  </svg>
                  <p className="measured text-accent">{preview.index} / {preview.label}</p>
                  <p key={preview.note} className="menu__preview-note">{preview.note}</p>
                </div>

                <div data-menu-fade className="menu__sections">
                  <p className="measured text-muted">On the home page</p>
                  <ul>
                    {SECTION_LINKS.map((s) => (
                      <li key={s.href}>
                        <Link href={s.href} onClick={closeMenu} className="menu__section-link">
                          <RollText text={s.label} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>

            <div className="menu__bottom">
              <div data-menu-fade className="menu__socials">
                <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="menu__social">
                  <RollText text="GitHub" />
                </a>
                <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="menu__social">
                  <RollText text="LinkedIn" />
                </a>
                <a href={`mailto:${PROFILE.email}`} className="menu__social">
                  <RollText text="Email" />
                </a>
              </div>
              <span data-menu-fade className="measured text-muted">
                Mumbai · {time} IST
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
