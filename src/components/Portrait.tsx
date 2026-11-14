"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { PROFILE } from "@/data/profile";

/**
 * Framed portrait for the About section. Renders PROFILE.portrait as a photo or a
 * muted looping video in a duotone treatment that blooms to full colour on hover,
 * with corner brackets, a scan line, a caption bar and a gentle 3D tilt.
 */
export function Portrait() {
  const { kind, src, poster, alt } = PROFILE.portrait;
  const cardRef = useRef<HTMLElement>(null);
  const fileName = src.split("/").pop() ?? "portrait";

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card, { rotateY: px * 10, rotateX: -py * 10, duration: 0.6, ease: "power3.out" });
    card.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    card.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };

  const onLeave = () => {
    if (cardRef.current) gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div className="portrait-wrap" data-anim-zone>
      <figure ref={cardRef} className="portrait" onPointerMove={onMove} onPointerLeave={onLeave}>
        <span className="hero-stage__corner hero-stage__corner--tl" aria-hidden="true" />
        <span className="hero-stage__corner hero-stage__corner--tr" aria-hidden="true" />
        <span className="hero-stage__corner hero-stage__corner--bl" aria-hidden="true" />
        <span className="hero-stage__corner hero-stage__corner--br" aria-hidden="true" />

        <div className="portrait__bar measured" aria-hidden="true">
          <span>
            <span className="hero-eyebrow__dot" /> {fileName}
          </span>
          <span className="text-muted">{kind === "video" ? "REC ●" : "4:5"}</span>
        </div>

        <div className="portrait__frame" data-reveal="image">
          {kind === "video" ? (
            <video className="portrait__media" src={src} poster={poster} autoPlay muted loop playsInline aria-label={alt} />
          ) : (
            <Image
              className="portrait__media"
              src={src}
              alt={alt}
              width={800}
              height={1000}
              sizes="(min-width: 60rem) 30vw, 90vw"
              unoptimized={src.endsWith(".svg")}
            />
          )}
          <span className="portrait__tint" aria-hidden="true" />
          <span className="portrait__glare" aria-hidden="true" />
          <span className="portrait__scan" aria-hidden="true" />
        </div>

        <figcaption className="portrait__caption measured">
          <span className="text-ink">{PROFILE.name}</span>
          <span className="text-muted">Mumbai · 19.07°N 72.87°E</span>
        </figcaption>
      </figure>
    </div>
  );
}
