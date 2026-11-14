"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ArrowUpRight, ChevronDown, Code2, FileCode2, FolderOpen, GitBranch, X } from "lucide-react";
import { ArchDiagram } from "@/components/ArchDiagram";
import { FEATURED_PROJECTS, type ProjectCaseStudy } from "@/data/projects";

const AUTO_MS = 7000;

type Tok = [cls: string, text: string];

const camel = (slug: string) => slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** A project rendered as a syntax-highlighted TS object literal, one token array per line. */
function codeLines(p: ProjectCaseStudy): Tok[][] {
  const str = (v: string): Tok => ["tk-str", `"${v}"`];
  const key = (k: string): Tok[] => [["tk-ind", "  "], ["tk-key", k], ["tk-pun", ": "]];
  const stack = p.stack.slice(0, 3);
  const lines: Tok[][] = [
    [["tk-com", `// ${p.category} · ${p.year}`]],
    [["tk-kw", "export const "], ["tk-var", camel(p.slug)], ["tk-pun", ": "], ["tk-type", "Project"], ["tk-pun", " = {"]],
    [...key("name"), str(p.name), ["tk-pun", ","]],
    [
      ...key("stack"),
      ["tk-pun", "["],
      ...stack.flatMap((s, i): Tok[] => (i < stack.length - 1 ? [str(s), ["tk-pun", ", "]] : [str(s)])),
      ["tk-pun", "],"],
    ],
    [...key("focus"), str(p.complexityFocus), ["tk-pun", ","]],
    [...key("ships"), str(p.tagline), ["tk-pun", ","]],
  ];
  if (p.liveUrl) lines.push([...key("live"), str(p.liveUrl.replace(/^https?:\/\//, "")), ["tk-pun", ","]]);
  lines.push([["tk-pun", "} "], ["tk-kw", "satisfies "], ["tk-type", "Shipped"], ["tk-pun", ";"]]);
  return lines;
}

/**
 * Projects presented as an editor session: an explorer tree on the left, an open
 * file with typed-out source and a live preview pane on the right, status bar below.
 * Auto-advances through files while visible until the visitor takes over.
 */
export function ProjectIDE() {
  const projects = FEATURED_PROJECTS;
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const firstRunRef = useRef(true);
  const visibleRef = useRef(false);

  const p = projects[active];
  const lines = codeLines(p);

  const select = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  // Track visibility so auto-advance only runs while the section is on screen
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = e.isIntersecting;
      root.dataset.visible = String(e.isIntersecting);
    }, { threshold: 0.35 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Auto-advance: the active file's progress bar fills, then the next file opens
  useEffect(() => {
    const bar = timerRef.current;
    if (!auto || !bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: AUTO_MS / 1000,
        ease: "none",
        paused: !visibleRef.current,
        onComplete: () => setActive((i) => (i + 1) % projects.length),
      }
    );
    const root = rootRef.current;
    const sync = () => (visibleRef.current ? tween.play() : tween.pause());
    const mo = root ? new MutationObserver(sync) : null;
    if (root && mo) mo.observe(root, { attributes: true, attributeFilter: ["data-visible"] });
    return () => {
      mo?.disconnect();
      tween.kill();
    };
  }, [active, auto, projects.length]);

  // File switch choreography: code retypes line by line, preview wipes in
  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const first = firstRunRef.current;
    firstRunRef.current = false;

    const ctx = gsap.context(() => {
      const codeLinesEls = editor.querySelectorAll<HTMLElement>(".code-line");
      const typing = gsap.fromTo(
        codeLinesEls,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.36,
          stagger: 0.09,
          ease: "steps(14)",
          paused: first,
          onComplete: () => editor.setAttribute("data-typed", "true"),
        }
      );
      editor.setAttribute("data-typed", "false");

      const preview = gsap.fromTo(
        "[data-ide-preview]",
        { clipPath: "inset(0 0 0 100%)", scale: 1.04 },
        { clipPath: "inset(0 0 0 0%)", scale: 1, duration: 0.9, ease: "expo.inOut", paused: first, clearProps: "clipPath,transform" }
      );
      gsap.fromTo("[data-ide-crumb]", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power3.out" });

      // On first mount, wait for the section to scroll into view before typing
      if (first) {
        const io = new IntersectionObserver(([e]) => {
          if (e.isIntersecting) {
            typing.play();
            preview.play();
            io.disconnect();
          }
        }, { threshold: 0.3 });
        io.observe(editor);
        return () => io.disconnect();
      }
    }, editor);

    return () => ctx.revert();
  }, [active]);

  return (
    <div ref={rootRef} className="ide" data-visible="false" data-anim-zone>
      {/* Title bar */}
      <div className="ide__titlebar">
        <span className="pcard__dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="ide__title measured">risu-portfolio — {p.slug}.case.ts</span>
        <span className="ide__title-right measured">{auto ? "autoplay" : "manual"}</span>
      </div>

      <div className="ide__body">
        {/* Explorer */}
        <aside className="ide__explorer" aria-label="Project files">
          <p className="ide__pane-label measured">Explorer</p>
          <p className="ide__folder measured">
            <ChevronDown size={13} aria-hidden="true" />
            <FolderOpen size={14} aria-hidden="true" />
            projects
          </p>
          <ul className="ide__files" role="tablist" aria-orientation="vertical">
            {projects.map((proj, i) => {
              const isActive = i === active;
              return (
                <li key={proj.slug}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="ide-editor"
                    className="ide__file"
                    onClick={() => select(i)}
                  >
                    <FileCode2 size={14} strokeWidth={1.75} aria-hidden="true" />
                    <span className="ide__file-name">{proj.slug}.case.ts</span>
                    <span className="ide__file-rank measured">0{proj.rank}</span>
                    {isActive && auto && <span ref={timerRef} className="ide__file-timer" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="ide__pane-label measured ide__pane-label--outline">Outline</p>
          <ul className="ide__outline measured">
            {["name", "stack", "focus", "ships", ...(p.liveUrl ? ["live"] : [])].map((k) => (
              <li key={`${p.slug}-${k}`}>
                <span className="tk-type">◇</span> {k}
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor */}
        <div id="ide-editor" ref={editorRef} className="ide__editor" role="tabpanel" aria-label={`${p.name} source`}>
          <div className="ide__tabs">
            <span className="ide__tab ide__tab--active measured">
              <Code2 size={12} strokeWidth={1.75} aria-hidden="true" />
              {p.slug}.case.ts
              <X size={12} strokeWidth={1.75} aria-hidden="true" className="ide__tab-x" />
            </span>
            <span className="ide__tab measured">README.md</span>
          </div>

          <div className="ide__crumbs measured">
            <span data-ide-crumb>projects</span>
            <span data-ide-crumb aria-hidden="true">›</span>
            <span data-ide-crumb>{p.slug}.case.ts</span>
            <span data-ide-crumb aria-hidden="true">›</span>
            <span data-ide-crumb className="tk-var">{camel(p.slug)}</span>
          </div>

          <div className="ide__split">
            <div className="ide__code-pane">
              <h3 className="ide__name">{p.name}</h3>
              <pre className="pcard__code">
                <code key={p.slug}>
                  {lines.map((line, li) => (
                    <span key={li} className="code-line">
                      <span className="code-ln" aria-hidden="true">{String(li + 1).padStart(2, "0")}</span>
                      {line.map(([cls, text], ti) => (
                        <span key={ti} className={cls}>
                          {text}
                        </span>
                      ))}
                    </span>
                  ))}
                  <span className="code-caret" aria-hidden="true" />
                </code>
              </pre>

              <div className="ide__actions">
                <Link href={`/work/${p.slug}`} className="btn btn--primary btn--compact">
                  <span>Open case study</span>
                  <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
                </Link>
                <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="pcard__link">
                  Source
                  <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                </a>
                {p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="pcard__link">
                    Live
                    <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>

            <div className="ide__preview-pane">
              <p className="ide__pane-label measured">
                {p.screenshotPath ? "preview — live capture" : "preview — architecture"}
              </p>
              <div key={p.slug} data-ide-preview className="ide__preview">
                {p.screenshotPath ? (
                  <Image
                    src={p.screenshotPath}
                    alt={p.screenshotAlt ?? `${p.name} interface`}
                    width={1440}
                    height={900}
                    sizes="(min-width: 60rem) 38vw, 100vw"
                    className="ide__shot"
                  />
                ) : (
                  <div className="pcard__diagram">
                    <ArchDiagram nodes={p.architectureFlow} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="ide__status measured">
        <span className="ide__status-item ide__status-item--accent">
          <GitBranch size={12} aria-hidden="true" /> main
        </span>
        <span className="ide__status-item">{p.runtime}</span>
        <span className="ide__status-item ide__status-right">Ln {lines.length}, Col 1</span>
        <span className="ide__status-item">TypeScript</span>
        <span className="ide__status-item">
          {String(active + 1).padStart(2, "0")}/{String(projects.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
