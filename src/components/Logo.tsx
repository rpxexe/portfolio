"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { INTRO_DONE_EVENT } from "@/components/PageLoader";

/**
 * Brand lockup:  [R mark]  risu▌
 *                          rishabh vishwakarma
 * The mark is the same "R" as app/icon.svg. On load its strokes draw in and the
 * cyan dot (shared by the mark and the "i" of risu) drops into place.
 */
export function Logo() {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.set(".logo__stroke", { strokeDashoffset: 1 });
      gsap.set(".logo__dot", { y: -14, opacity: 0 });
      gsap.set(".logo__char", { yPercent: 110 });

      const play = () =>
        gsap
          .timeline()
          .to(".logo__stroke", { strokeDashoffset: 0, duration: 1, stagger: 0.12, ease: "power3.inOut" })
          .to(".logo__char", { yPercent: 0, duration: 0.7, stagger: 0.05, ease: "expo.out" }, 0.25)
          .to(".logo__dot", { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "bounce.out" }, 0.6);

      if (document.querySelector(".intro-overlay")) {
        window.addEventListener(INTRO_DONE_EVENT, play, { once: true });
        return () => window.removeEventListener(INTRO_DONE_EVENT, play);
      }
      play();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <span ref={rootRef} className="logo">
      <svg className="logo__mark" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="2" y="2" width="60" height="60" rx="16" className="logo__tile" />
        <g className="logo__orbit">
          <path d="M10 46 A 26 26 0 0 1 22 9" pathLength={1} className="logo__stroke logo__arc" />
        </g>
        <path
          d="M23 47V17h11.5a8.5 8.5 0 0 1 0 17H23M33 34l10 13"
          pathLength={1}
          className="logo__stroke logo__r"
        />
        <circle cx="47" cy="17" r="4" className="logo__dot logo__dot--mark" />
      </svg>

      <span className="logo__type">
        <span className="logo__word" aria-hidden="true">
          <span className="logo__clip">
            <span className="logo__char">r</span>
          </span>
          <span className="logo__i">
            <span className="logo__clip">
              <span className="logo__char">ı</span>
            </span>
            <span className="logo__dot logo__dot--i" />
          </span>
          <span className="logo__clip">
            <span className="logo__char">s</span>
          </span>
          <span className="logo__clip">
            <span className="logo__char">u</span>
          </span>
          <span className="logo__cursor" />
        </span>
        <span className="logo__sub measured" aria-hidden="true">
          rishabh vishwakarma
        </span>
      </span>
    </span>
  );
}
