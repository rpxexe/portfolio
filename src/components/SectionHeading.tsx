"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import DecryptedText from "@/components/DecryptedText";

/**
 * Section heading: giant outlined index number, a decrypting mono kicker, and a
 * title whose words rise out of masks. Wrap one word in *asterisks* to set it in
 * the serif italic accent with a hand-drawn SVG underline that scribbles in.
 *
 *   <SectionHeading index="02" kicker="selected_work" title="Things I've *shipped*" id="..." />
 */
export function SectionHeading({
  index,
  kicker,
  title,
  id,
  as: Tag = "h2",
  align = "start",
}: {
  index: string;
  kicker: string;
  title: string;
  id?: string;
  as?: ElementType;
  align?: "start" | "center";
}) {
  const rootRef = useRef<HTMLElement>(null);
  const segments = title.split(/(\*[^*]+\*)/).filter(Boolean);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const words = root.querySelectorAll(".sh__wi");
        const scribble = root.querySelectorAll(".sh__scribble path");
        gsap.set(words, { yPercent: 115, rotate: 5 });
        gsap.set(scribble, { strokeDashoffset: 1 });
        gsap.set(".sh__num", { clipPath: "inset(100% 0% 0% 0%)", y: 30 });

        const play = () =>
          gsap
            .timeline()
            .to(".sh__num", { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.2, ease: "expo.out" }, 0)
            .to(words, { yPercent: 0, rotate: 0, duration: 1, stagger: 0.07, ease: "expo.out" }, 0.1)
            .to(scribble, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 0.55);

        const io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              play();
              io.disconnect();
            }
          },
          { rootMargin: "0px 0px -15% 0px" }
        );
        io.observe(root);
        return () => io.disconnect();
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <header ref={rootRef} className={`sh sh--${align}`} data-no-reveal data-anim-zone>
      <span className="sh__num" aria-hidden="true">
        {index}
      </span>
      <p className="sh__kicker measured">
        <span className="sh__bracket" aria-hidden="true">[</span>
        <DecryptedText
          text={kicker}
          animateOn="view"
          speed={45}
          sequential
          revealDirection="start"
          className="sh__kicker-text"
          parentClassName="sh__kicker-text"
        />
        <span className="sh__bracket" aria-hidden="true">]</span>
      </p>
      <Tag id={id} className="sh__title">
        {segments.map((seg, si) => {
          const isEm = seg.startsWith("*") && seg.endsWith("*");
          const text = isEm ? seg.slice(1, -1) : seg;
          const words = text.split(/(\s+)/);
          const rendered = words.map((w, wi) => {
            if (/^\s+$/.test(w)) return " ";
            if (!w) return null;
            return (
              <span key={`${si}-${wi}`} className="sh__w">
                <span className="sh__wi">{w}</span>
              </span>
            );
          });
          if (!isEm) return rendered;
          return (
            <em key={`em-${si}`} className="sh__em">
              {rendered}
              <svg className="sh__scribble" viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 15 C 38 6, 70 20, 104 11 S 168 5, 197 13" pathLength={1} />
                <path d="M20 20 C 60 15, 120 22, 186 17" pathLength={1} />
              </svg>
            </em>
          );
        })}
      </Tag>
    </header>
  );
}
