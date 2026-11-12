"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Check, Copy, Mail, Pause, Plus, Minus, Play } from "lucide-react";
import CountUp from "@/components/CountUp";
import DecryptedText from "@/components/DecryptedText";
import SpotlightCard from "@/components/SpotlightCard";
import { Magnetic } from "@/components/Magnetic";
import { SignalString } from "@/components/SignalString";
import { WobbleCard } from "@/components/WobbleCard";
import { PROFILE } from "@/data/profile";
import { FEATURED_PROJECTS, PROJECTS } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const MARQUEE_STACK = [
  "TypeScript",
  "Next.js",
  "Electron",
  "WebRTC",
  "Inngest",
  "PostgreSQL",
  "GSAP",
  "Lenis",
];

const SHOWCASE_CARDS = PROJECTS.filter((p) => Boolean(p.screenshotPath));

const INTRO_STACK_COLUMNS = [
  { area: "Desktop & Native", detail: "Electron 34, C# Win32 SendInput, SQLite WAL" },
  { area: "AI Orchestration", detail: "Inngest DAGs, ReactFlow, OpenAI, Gemini, Anthropic" },
  { area: "Web & Persistence", detail: "Next.js 16, TypeScript, PostgreSQL, MongoDB" },
];

const PRINCIPLES = [
  {
    code: "01",
    title: "Native Win32 Precision",
    summary: "Sub-millisecond pointer and keyboard synthesis via zero-dependency C# SendInput.",
  },
  {
    code: "02",
    title: "Durable AI DAGs",
    summary: "Topological ReactFlow execution pipelines backed by step-safe Inngest retries.",
  },
  {
    code: "03",
    title: "Zero-Cloud Crypto",
    summary: "Local UDP subnet discovery and TLS 1.3 sealed inside Windows DPAPI storage.",
  },
  {
    code: "04",
    title: "Transactional Clarity",
    summary: "Zero-write Excel dry runs and atomic employee asset offboarding.",
  },
];

const FACTS = [
  { label: "Repositories shipped", value: PROJECTS.length, suffix: "" },
  { label: "Years production web", value: 1.5, decimals: 1, suffix: "+" },
  { label: "B.Sc. IT CGPI (/10)", value: 8.7, decimals: 1, suffix: "" },
  { label: "College coding rank", value: 1, suffix: "st" },
];

const FAQ_ITEMS = [
  {
    index: "01",
    question: "What systems and stacks do you build with?",
    answer:
      "TypeScript, Next.js 16, React 19, and PostgreSQL/MongoDB on the web alongside Electron, WebRTC, and native C# Win32 tooling on Windows.",
  },
  {
    index: "02",
    question: "How do you handle long-running AI workflows?",
    answer:
      "Through directed acyclic graphs sorted topologically and dispatched over Inngest event steps with realtime streaming telemetry and multi-provider fallbacks.",
  },
  {
    index: "03",
    question: "Are you available for full-time or select projects?",
    answer:
      "Yes. Currently open to full-stack and systems engineering roles as well as scoped technical builds requiring high-reliability execution.",
  },
  {
    index: "04",
    question: "Where can I inspect source code and deployments?",
    answer:
      "Every featured project includes live deployments where hosted, architecture diagrams, and source links inside the Work index and GitHub.",
  },
];

export function HomeSections() {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [marqueeRunning, setMarqueeRunning] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const workStageRef = useRef<HTMLDivElement>(null);
  const kineticTopRef = useRef<HTMLDivElement>(null);
  const kineticBotRef = useRef<HTMLDivElement>(null);
  const horizSectionRef = useRef<HTMLElement>(null);
  const horizPinRef = useRef<HTMLDivElement>(null);
  const horizTrackRef = useRef<HTMLDivElement>(null);
  const auditTrailRef = useRef<HTMLDivElement>(null);
  const auditSpineRef = useRef<HTMLSpanElement>(null);

  const hoveredProject = PROJECTS.find((p) => p.slug === hoveredSlug && p.screenshotPath);

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia();

    // ScrollTrigger kinetic typography + audit spine
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let cleanupScrollEnd: (() => void) | undefined;
      const ctx = gsap.context(() => {
        ScrollTrigger.batch("[data-gsap-row]", {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y: 16, opacity: 0.25 },
              {
                y: 0,
                opacity: 1,
                duration: 0.45,
                stagger: 0.06,
                ease: "power3.out",
                clearProps: "transform,opacity",
              }
            );
          },
        });

        if (kineticTopRef.current && kineticBotRef.current) {
          const topSkewTo = gsap.quickTo(kineticTopRef.current, "skewX", { duration: 0.35, ease: "power3.out" });
          const botSkewTo = gsap.quickTo(kineticBotRef.current, "skewX", { duration: 0.35, ease: "power3.out" });
          const resetSkew = () => {
            topSkewTo(0);
            botSkewTo(0);
          };

          gsap.fromTo(
            kineticTopRef.current,
            { xPercent: -4 },
            {
              xPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: kineticTopRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.4,
                onUpdate: (self) => {
                  const vel = Math.max(-4.5, Math.min(4.5, self.getVelocity() * 0.002));
                  topSkewTo(-vel);
                  botSkewTo(vel);
                },
                onLeave: resetSkew,
                onLeaveBack: resetSkew,
              },
            }
          );

          ScrollTrigger.addEventListener("scrollEnd", resetSkew);
          cleanupScrollEnd = () => ScrollTrigger.removeEventListener("scrollEnd", resetSkew);

          gsap.fromTo(
            kineticBotRef.current,
            { xPercent: 4 },
            {
              xPercent: -4,
              ease: "none",
              scrollTrigger: {
                trigger: kineticBotRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.4,
              },
            }
          );
        }

        if (auditTrailRef.current && auditSpineRef.current) {
          gsap.fromTo(
            auditSpineRef.current,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: auditTrailRef.current,
                start: "top 75%",
                end: "bottom 60%",
                scrub: 0.35,
              },
            }
          );
        }
      });

      return () => {
        cleanupScrollEnd?.();
        ctx.revert();
      };
    });

    // Desktop-only Pinned Horizontal Gallery + Multi-Plane Parallax
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 60rem)", () => {
      const section = horizSectionRef.current;
      const pinTarget = horizPinRef.current;
      const track = horizTrackRef.current;
      let cleanupHorizScrollEnd: (() => void) | undefined;

      const ctx = gsap.context(() => {
        if (section && pinTarget && track) {
          const getScrollAmount = () => {
            const innerW = (track.parentElement?.clientWidth ?? pinTarget.clientWidth) - 128;
            return Math.max(0, track.scrollWidth - innerW);
          };
          const trackSkewTo = gsap.quickTo(track, "skewX", { duration: 0.32, ease: "power3.out" });
          const resetTrackSkew = () => trackSkewTo(0);

          gsap.to(track, {
            x: () => -getScrollAmount(),
            ease: "none",
            scrollTrigger: {
              trigger: pinTarget,
              start: "top 69px",
              end: () => `+=${getScrollAmount()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const lean = Math.max(-3.2, Math.min(3.2, self.getVelocity() * 0.0016));
                trackSkewTo(-lean);
              },
              onLeave: resetTrackSkew,
              onLeaveBack: resetTrackSkew,
            },
          });

          ScrollTrigger.addEventListener("scrollEnd", resetTrackSkew);
          cleanupHorizScrollEnd = () => ScrollTrigger.removeEventListener("scrollEnd", resetTrackSkew);

          const cardParallaxes = gsap.utils.toArray<HTMLElement>("[data-horiz-parallax]");
          cardParallaxes.forEach((wrap, idx) => {
            const offset = idx % 2 === 0 ? 10 : -10;
            gsap.fromTo(
              wrap,
              { y: offset },
              {
                y: -offset,
                ease: "none",
                scrollTrigger: {
                  trigger: pinTarget,
                  start: "top 69px",
                  end: () => `+=${getScrollAmount()}`,
                  scrub: 0.6,
                  invalidateOnRefresh: true,
                },
              }
            );
          });
        }

        // Counter-depth drift on sticky rotated editorial margin rails
        const rails = gsap.utils.toArray<HTMLElement>(".editorial-rail");
        rails.forEach((rail) => {
          const grid = rail.closest(".editorial-grid") ?? rail;
          gsap.fromTo(
            rail,
            { y: 26, rotation: 180 },
            {
              y: -26,
              rotation: 180,
              ease: "none",
              scrollTrigger: {
                trigger: grid,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        });

        // Staggered vertical parallax on introduction capability columns
        const introCols = gsap.utils.toArray<HTMLElement>("[data-parallax-col]");
        const colDepths = [22, -10, 30];
        introCols.forEach((col, i) => {
          const d = colDepths[i % colDepths.length];
          gsap.fromTo(
            col,
            { y: d },
            {
              y: -d,
              ease: "none",
              scrollTrigger: {
                trigger: col.closest("section") ?? col,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.45,
              },
            }
          );
        });

        // Subtle opposite-lane parallax across Principles bento columns
        const leftTiles = gsap.utils.toArray<HTMLElement>("[data-parallax-tile='left']");
        const rightTiles = gsap.utils.toArray<HTMLElement>("[data-parallax-tile='right']");
        leftTiles.forEach((tile) => {
          gsap.fromTo(
            tile,
            { y: 16 },
            {
              y: -16,
              ease: "none",
              scrollTrigger: {
                trigger: tile.closest("section") ?? tile,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        });
        rightTiles.forEach((tile) => {
          gsap.fromTo(
            tile,
            { y: -12 },
            {
              y: 12,
              ease: "none",
              scrollTrigger: {
                trigger: tile.closest("section") ?? tile,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        });

        // Depth float between Facts bento card and Experience timeline
        const factsCard = document.querySelector<HTMLElement>("[data-parallax-facts]");
        if (factsCard) {
          gsap.fromTo(
            factsCard,
            { y: 18 },
            {
              y: -18,
              ease: "none",
              scrollTrigger: {
                trigger: factsCard.closest("section") ?? factsCard,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        }
      });

      return () => {
        cleanupHorizScrollEnd?.();
        ctx.revert();
      };
    });

    // Mobile vertical depth float inside stacked live capture cards
    mm.add("(prefers-reduced-motion: no-preference) and (max-width: 59.99rem)", () => {
      const ctx = gsap.context(() => {
        const wraps = gsap.utils.toArray<HTMLElement>("[data-horiz-parallax]");
        wraps.forEach((wrap) => {
          gsap.fromTo(
            wrap,
            { y: 12 },
            {
              y: -12,
              ease: "none",
              scrollTrigger: {
                trigger: wrap,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            }
          );
        });
      });

      return () => ctx.revert();
    });

    // Physics inertia + wobble floating preview tracking cursor over work rows
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 60rem)", () => {
      const stage = workStageRef.current;
      const preview = previewRef.current;
      if (!stage || !preview) return;

      const xTo = gsap.quickTo(preview, "x", { duration: 0.38, ease: "power3.out" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.38, ease: "power3.out" });
      const rotTo = gsap.quickTo(preview, "rotation", { duration: 0.45, ease: "elastic.out(1, 0.5)" });
      const skewYTo = gsap.quickTo(preview, "skewY", { duration: 0.4, ease: "elastic.out(1, 0.55)" });

      let lastX = 0;
      let lastY = 0;

      const onMove = (e: PointerEvent) => {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        const clampedRot = Math.max(-9, Math.min(9, dx * 0.32));
        const clampedSkew = Math.max(-4, Math.min(4, dy * 0.16));
        xTo(e.clientX + 28);
        yTo(e.clientY - 110);
        rotTo(clampedRot);
        skewYTo(clampedSkew);
      };

      const onEnter = (e: PointerEvent) => {
        lastX = e.clientX;
        lastY = e.clientY;
        gsap.set(preview, { x: e.clientX + 28, y: e.clientY - 110 });
      };

      const onLeave = () => {
        setHoveredSlug(null);
        rotTo(0);
        skewYTo(0);
      };

      stage.addEventListener("pointerenter", onEnter);
      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);

      return () => {
        stage.removeEventListener("pointerenter", onEnter);
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.to(preview, {
      opacity: hoveredProject ? 1 : 0,
      scale: hoveredProject ? 1 : 0.92,
      duration: 0.24,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, [hoveredProject]);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  }

  return (
    <>
      {/* 01: Introduction with Rotated Rail */}
      <section id="introduction" className="band-section band-section--raised" aria-labelledby="intro-heading">
        <div className="container">
          <div className="editorial-grid">
            <span className="editorial-rail" aria-hidden="true">
              /about me
            </span>

            <div className="flex flex-col gap-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <h2 id="intro-heading" className="text-3xl sm:text-5xl font-medium leading-tight max-w-4xl">
                  <span className="text-ink">I craft full-stack systems where native speed meets clarity. </span>
                  <span className="text-muted">
                    From C# Win32 hooks to durable AI pipelines.
                  </span>
                </h2>

                <Magnetic strength={3}>
                  <Link href="/resume" className="bracket-btn shrink-0">
                    Resume
                  </Link>
                </Magnetic>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-rule">
                {INTRO_STACK_COLUMNS.map((col) => (
                  <div key={col.area} data-parallax-col className="grid gap-1.5">
                    <DecryptedText
                      text={col.area}
                      animateOn="hover"
                      speed={40}
                      className="text-sm font-medium text-accent"
                      parentClassName="text-sm font-medium"
                    />
                    <p className="text-sm text-ink-2">{col.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02: Selected Work Index + Physics Signal String */}
      <section id="work-index" className="work-index-section" aria-labelledby="work-index-heading">
        <div className="container">
          <div className="editorial-grid">
            <span className="editorial-rail" aria-hidden="true">
              /featured
            </span>

            <div>
              <div className="section-head-split">
                <h2 id="work-index-heading">..best works</h2>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <p className="lead text-ink-2">Hover a row for live capture, or inspect the architecture.</p>
                  <Magnetic strength={3}>
                    <Link href="/work" className="bracket-btn shrink-0">
                      All {PROJECTS.length} works
                    </Link>
                  </Magnetic>
                </div>
              </div>

              <div ref={workStageRef} className="work-stage">
                <div ref={previewRef} className="floating-preview" aria-hidden="true">
                  {hoveredProject?.screenshotPath && (
                    <Image
                      src={hoveredProject.screenshotPath}
                      alt=""
                      width={1440}
                      height={900}
                      className="capture-frame__media"
                    />
                  )}
                </div>

                <div className="work-index">
                  {FEATURED_PROJECTS.map((project) => (
                    <article
                      key={project.slug}
                      className="work-row"
                      data-gsap-row
                      onPointerEnter={() => setHoveredSlug(project.slug)}
                    >
                      <span className="measured text-cool">0{project.rank}</span>

                      <div>
                        <h3 className="text-2xl sm:text-3xl font-medium text-ink">
                          <Link href={`/work/${project.slug}`} className="hover:text-accent transition-colors">
                            {project.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted mt-1">{project.tagline}</p>
                      </div>

                      <div>
                        <span className="measured text-ink-2">{project.runtime}</span>
                      </div>

                      <div className="flex items-center justify-start md:justify-end gap-5 text-sm">
                        <Link href={`/work/${project.slug}`} className="text-link font-medium">
                          Case study
                        </Link>
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-link"
                          >
                            <span>Live</span>
                            <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SignalString />
        </div>
      </section>

      {/* Kinetic Typography + Pauseable Stack Marquee */}
      <section className="kinetic-band" aria-label="Core engineering capabilities">
        <div ref={kineticTopRef} className="kinetic-track text-ink">
          <span>ELECTRON</span>
          <span className="serif-flourish text-accent">WebRTC</span>
          <span>WIN32</span>
          <span className="serif-flourish text-cool">TLS 1.3</span>
          <span>SQLITE</span>
        </div>
        <div ref={kineticBotRef} className="kinetic-track text-ink-2">
          <span className="serif-flourish text-accent">Next.js</span>
          <span>INNGEST</span>
          <span className="serif-flourish text-cool">Multi-LLM</span>
          <span>SANDBOX</span>
          <span>TYPESCRIPT</span>
        </div>

        <div
          className={`container marquee-viewport pt-6 border-t border-rule ${marqueeRunning ? "is-running" : ""}`}
          data-loop
        >
          <button
            type="button"
            className="btn btn--compact shrink-0"
            aria-label={marqueeRunning ? "Pause capability marquee" : "Play capability marquee"}
            onClick={() => setMarqueeRunning((v) => !v)}
          >
            {marqueeRunning ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            <span>{marqueeRunning ? "Pause" : "Play"}</span>
          </button>

          <div className="overflow-hidden flex-1">
            <div className="marquee-strip measured text-muted">
              {MARQUEE_STACK.map((item) => (
                <span key={item} className="whitespace-nowrap">
                  {item}
                </span>
              ))}
              <span aria-hidden="true" className="contents">
                {MARQUEE_STACK.map((item) => (
                  <span key={`dup-${item}`} className="whitespace-nowrap">
                    {item}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 03: Pinned Horizontal Deployed Interfaces */}
      <section ref={horizSectionRef} className="horiz-section" aria-labelledby="showcase-heading">
        <div ref={horizPinRef} className="horiz-pin">
          <div className="container mb-6">
            <div className="section-head-split" style={{ marginBottom: 0 }}>
              <h2 id="showcase-heading">..live captures</h2>
              <p className="lead text-ink-2">Scroll to pan desktop and web deployments.</p>
            </div>
          </div>

          <div className="container">
            <div ref={horizTrackRef} className="horiz-track">
              {SHOWCASE_CARDS.map((project) => (
                <div key={project.slug} data-horiz-parallax className="horiz-card-wrap">
                  <WobbleCard as="article" tilt={6} wobble={1.15} className="horiz-card">
                    <figure className="capture-frame">
                      <Image
                        src={project.screenshotPath ?? "/projects/arcix-home-desktop.png"}
                        alt={project.screenshotAlt ?? `${project.name} screenshot`}
                        width={1440}
                        height={900}
                        className="capture-frame__media"
                      />
                    </figure>

                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="text-title font-medium text-ink">{project.name}</h3>
                        <p className="text-sm text-muted">{project.category}</p>
                      </div>
                      <Link href={`/work/${project.slug}`} className="text-link text-sm font-medium shrink-0">
                        Case study
                      </Link>
                    </div>
                  </WobbleCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04: Principles Bento powered by React Bits SpotlightCard */}
      <section id="principles" className="band-section band-section--deep" aria-labelledby="principles-heading">
        <div className="container">
          <div className="editorial-grid">
            <span className="editorial-rail" aria-hidden="true">
              /principles
            </span>

            <div>
              <div className="section-head-split">
                <h2 id="principles-heading">..work principles</h2>
                <p className="lead text-ink-2">
                  Architecture decisions shaped around latency, safety, and maintainability.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {PRINCIPLES.map((item, idx) => (
                  <div key={item.code} data-parallax-tile={idx % 2 === 0 ? "left" : "right"}>
                    <WobbleCard tilt={7} wobble={1.3} className="rounded-xl h-full">
                      <SpotlightCard
                        spotlightColor="oklch(82% 0.19 162)"
                        intensity={0.14}
                        borderGlow={0.65}
                        className="p-6 sm:p-7 flex flex-col justify-between gap-6 h-full"
                      >
                        <DecryptedText
                          text={item.code}
                          animateOn="hover"
                          speed={35}
                          className="measured text-cool"
                          parentClassName="measured"
                        />
                        <div className="grid gap-2">
                          <h3 className="text-title font-medium text-ink">{item.title}</h3>
                          <p className="text-sm text-ink-2">{item.summary}</p>
                        </div>
                      </SpotlightCard>
                    </WobbleCard>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05: Experience Timeline & React Bits CountUp Facts */}
      <section id="experience" className="band-section--large" aria-labelledby="experience-heading">
        <div className="container">
          <div className="editorial-grid">
            <span className="editorial-rail" aria-hidden="true">
              /experience
            </span>

            <div>
              <div className="section-head-split">
                <h2 id="experience-heading">..facts &amp; record</h2>
                <p className="lead text-ink-2">Production delivery backed by computer science fundamentals.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6">
                  <div ref={auditTrailRef} className="audit-trail">
                    <span ref={auditSpineRef} className="audit-trail__progress" aria-hidden="true" />
                    {PROFILE.experience.map((exp) => (
                      <article key={exp.id} className="audit-entry">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-title font-medium text-ink">
                            {exp.role}, {exp.organization}
                          </h3>
                          <span className="measured text-cool">{exp.period}</span>
                        </div>
                        <p className="text-sm text-ink-2">
                          Next.js, Node.js, PostgreSQL/MongoDB APIs, and multi-LLM pipelines.
                        </p>
                      </article>
                    ))}

                    {PROFILE.education.map((edu) => (
                      <article key={edu.degree} className="audit-entry">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-title font-medium text-ink">B.Sc. Information Technology</h3>
                          <span className="measured text-cool">{edu.period}</span>
                        </div>
                        <p className="text-sm text-ink-2">Smt. K.G. Mittal Institute, Mumbai</p>
                        <p className="measured text-accent">{edu.score}</p>
                      </article>
                    ))}

                    <article className="audit-entry">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-title font-medium text-ink">College Coding Competition</h3>
                        <span className="measured text-cool">C++, DSA</span>
                      </div>
                      <p className="text-sm text-ink-2">1st position in algorithmic problem solving.</p>
                    </article>
                  </div>
                </div>

                <div className="lg:col-span-6 flex flex-col gap-6 record-sticky">
                  <div data-parallax-facts>
                    <WobbleCard tilt={5.5} wobble={1.15} className="rounded-xl">
                      <div className="facts-grid">
                        {FACTS.map((fact) => (
                          <div key={fact.label} className="fact-cell">
                            <div className="fact-num">
                              <CountUp
                                to={fact.value}
                                decimals={fact.decimals}
                                suffix={fact.suffix}
                                duration={1.4}
                                easing="spring"
                                replayOnHover
                              />
                              <span className="fact-dot" aria-hidden="true" />
                            </div>
                            <p className="text-sm text-muted">{fact.label}</p>
                          </div>
                        ))}
                      </div>
                    </WobbleCard>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <Link href="/resume" className="text-link text-sm font-medium">
                      Full web resume
                    </Link>
                    <a href={PROFILE.resumePdfPath} download className="text-link text-sm">
                      Download PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06: Interactive FAQ Accordion + Direct Contact */}
      <section id="faq" className="band-section band-section--raised" aria-labelledby="faq-heading">
        <div className="container">
          <div className="editorial-grid">
            <span className="editorial-rail" aria-hidden="true">
              /faq
            </span>

            <div className="flex flex-col gap-10">
              <h2 id="faq-heading">..faq</h2>

              <div className="faq-list">
                {FAQ_ITEMS.map((item) => {
                  const isOpen = openFaq === item.index;
                  return (
                    <div key={item.index} className="faq-item">
                      <button
                        type="button"
                        className="faq-trigger"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaq((curr) => (curr === item.index ? null : item.index))}
                      >
                        <span className="text-base font-medium">{item.question}</span>
                        {isOpen ? (
                          <Minus size={16} strokeWidth={1.75} className="text-accent shrink-0" aria-hidden="true" />
                        ) : (
                          <Plus size={16} strokeWidth={1.75} className="text-muted shrink-0" aria-hidden="true" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="faq-body">
                          <p className="text-sm text-ink-2 max-w-2xl">{item.answer}</p>
                          <span className="faq-index-huge" aria-hidden="true">
                            {item.index}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4">
                <div>
                  <h3 className="text-2xl font-medium text-ink">Still have questions?</h3>
                  <p className="text-sm text-muted mt-1">{PROFILE.availability}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button type="button" onClick={handleCopyEmail} className="btn btn--compact">
                    {copiedEmail ? (
                      <Check size={15} strokeWidth={1.75} aria-hidden="true" />
                    ) : (
                      <Copy size={15} strokeWidth={1.75} aria-hidden="true" />
                    )}
                    <span>{copiedEmail ? "Copied" : PROFILE.email}</span>
                  </button>
                  <Magnetic strength={3}>
                    <Link href="/contact" className="bracket-btn">
                      <Mail size={14} strokeWidth={1.75} aria-hidden="true" />
                      <span>Ask me</span>
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
