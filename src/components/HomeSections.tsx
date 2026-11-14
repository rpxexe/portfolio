"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Copy, Mail, Plus } from "lucide-react";
import CountUp from "@/components/CountUp";
import DecryptedText from "@/components/DecryptedText";
import SpotlightCard from "@/components/SpotlightCard";
import { Magnetic } from "@/components/Magnetic";
import { SignalString } from "@/components/SignalString";
import { WobbleCard } from "@/components/WobbleCard";
import { ProjectIDE } from "@/components/ProjectIDE";
import { SectionHeading } from "@/components/SectionHeading";
import { Portrait } from "@/components/Portrait";
import { SkillsShowcase } from "@/components/SkillsShowcase";
import { PROFILE } from "@/data/profile";
import { isLite } from "@/lib/motion";
import { PROJECTS } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const kineticTopRef = useRef<HTMLDivElement>(null);
  const kineticBotRef = useRef<HTMLDivElement>(null);
  const auditTrailRef = useRef<HTMLDivElement>(null);
  const auditSpineRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia();

    // ScrollTrigger kinetic typography + audit spine
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let cleanupScrollEnd: (() => void) | undefined;
      const ctx = gsap.context(() => {
        if (kineticTopRef.current && kineticBotRef.current) {
          // Lite: skip per-scroll-frame velocity skew, keep the cheap scrubbed drift
          const lite = isLite();
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
                  if (lite) return;
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
      const ctx = gsap.context(() => {
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

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

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
              <div className="intro-grid">
                <div className="intro-grid__copy">
                  <SectionHeading index="01" kicker="about.me" title="Native speed, *clear* code." id="intro-heading" />

                  <p data-reveal className="intro-statement">
                    <span className="text-ink">I craft full-stack systems where native speed meets clarity. </span>
                    <span className="text-muted">From C# Win32 hooks to durable AI pipelines.</span>
                  </p>

                  <div data-reveal>
                    <Magnetic strength={3}>
                      <Link href="/resume" className="bracket-btn shrink-0">
                        Resume
                      </Link>
                    </Magnetic>
                  </div>
                </div>

                <Portrait />
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
                <SectionHeading index="02" kicker="selected_work" title="Things I've *shipped*" id="work-index-heading" />
                <div data-reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <p className="lead text-ink-2">Open any build in the editor: its stack, focus, and what it ships.</p>
                  <Magnetic strength={3}>
                    <Link href="/work" className="bracket-btn shrink-0">
                      All {PROJECTS.length} works
                    </Link>
                  </Magnetic>
                </div>
              </div>

              <ProjectIDE />
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

      </section>

      {/* 03: Toolbox: icon marquees + animated domain emblems */}
      <SkillsShowcase />

      {/* 04: Principles Bento powered by React Bits SpotlightCard */}
      <section id="principles" className="band-section band-section--deep" aria-labelledby="principles-heading">
        <div className="container">
          <div className="editorial-grid">
            <span className="editorial-rail" aria-hidden="true">
              /principles
            </span>

            <div>
              <div className="section-head-split">
                <SectionHeading index="04" kicker="principles" title="How I *engineer*" id="principles-heading" />
                <p data-reveal className="lead text-ink-2">
                  Architecture decisions shaped around latency, safety, and maintainability.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {PRINCIPLES.map((item, idx) => (
                  <div key={item.code} data-parallax-tile={idx % 2 === 0 ? "left" : "right"}>
                    <div data-reveal className="h-full">
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
                <SectionHeading index="05" kicker="track_record" title="Proof, not *promises*" id="experience-heading" />
                <p data-reveal className="lead text-ink-2">Production delivery backed by computer science fundamentals.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6">
                  <div ref={auditTrailRef} className="audit-trail">
                    <span ref={auditSpineRef} className="audit-trail__progress" aria-hidden="true" />
                    {PROFILE.experience.map((exp) => (
                      <article key={exp.id} data-reveal className="audit-entry">
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
                      <article key={edu.degree} data-reveal className="audit-entry">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-title font-medium text-ink">B.Sc. Information Technology</h3>
                          <span className="measured text-cool">{edu.period}</span>
                        </div>
                        <p className="text-sm text-ink-2">Smt. K.G. Mittal Institute, Mumbai</p>
                        <p className="measured text-accent">{edu.score}</p>
                      </article>
                    ))}

                    <article data-reveal className="audit-entry">
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
                      <div className="facts-grid" data-reveal-stagger>
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

                  <div data-reveal className="flex items-center justify-between gap-4 pt-2">
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
              <SectionHeading index="06" kicker="faq" title="Questions, *answered*" id="faq-heading" />

              <div className="faq-list" data-reveal-stagger>
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
                        <Plus size={16} strokeWidth={1.75} className="faq-icon" aria-hidden="true" />
                      </button>

                      <div className="faq-panel" data-open={isOpen} inert={!isOpen}>
                        <div>
                          <div className="faq-body">
                            <p className="text-sm text-ink-2 max-w-2xl">{item.answer}</p>
                            <span className="faq-index-huge" aria-hidden="true">
                              {item.index}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div data-reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4">
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
