"use client";

import React, { useEffect, useRef } from "react";

export interface WobbleCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "article";
  tilt?: number;
  wobble?: number;
  perspective?: number;
  impulseOnView?: boolean;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function WobbleCard({
  as = "div",
  tilt = 6.5,
  wobble = 1,
  perspective = 920,
  impulseOnView = true,
  className = "",
  style,
  children,
  ...rest
}: WobbleCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const s = {
      rx: 0,
      ry: 0,
      rz: 0,
      squash: 0,
      lift: 0,
      vrx: 0,
      vry: 0,
      vrz: 0,
      vSquash: 0,
      vLift: 0,
      targetRx: 0,
      targetRy: 0,
      targetLift: 0,
    };

    const pointer = { x: 0, y: 0, hasPrev: false, inside: false };
    let rafId = 0;
    let lastTime = 0;
    let alive = true;
    let didViewWobble = false;

    const tick = (now: number) => {
      rafId = 0;
      if (!alive) return;

      const dt = clamp((now - lastTime) / 1000, 0.001, 0.032);
      lastTime = now;

      // Coupled second-order damped harmonic oscillators
      const tiltK = 185;
      const tiltC = 14;
      const wobbleK = 155;
      const wobbleC = 8.6;
      const squashK = 220;
      const squashC = 11.2;

      s.vrx += ((s.targetRx - s.rx) * tiltK - s.vrx * tiltC) * dt;
      s.vry += ((s.targetRy - s.ry) * tiltK - s.vry * tiltC) * dt;
      s.vrz += ((-s.rz) * wobbleK - s.vrz * wobbleC) * dt;
      s.vSquash += ((-s.squash) * squashK - s.vSquash * squashC) * dt;
      s.vLift += ((s.targetLift - s.lift) * tiltK - s.vLift * 15) * dt;

      s.rx += s.vrx * dt;
      s.ry += s.vry * dt;
      s.rz += s.vrz * dt;
      s.squash += s.vSquash * dt;
      s.lift += s.vLift * dt;

      const scaleX = 1 + s.squash * 0.035 + s.lift * 0.016;
      const scaleY = 1 - s.squash * 0.028 + s.lift * 0.016;

      node.style.transform = `perspective(${perspective}px) rotateX(${s.rx.toFixed(3)}deg) rotateY(${s.ry.toFixed(3)}deg) rotateZ(${s.rz.toFixed(3)}deg) scale3d(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)}, 1)`;

      const disp =
        Math.abs(s.rx - s.targetRx) +
        Math.abs(s.ry - s.targetRy) +
        Math.abs(s.rz) +
        Math.abs(s.squash) +
        Math.abs(s.lift - s.targetLift);
      const vel =
        Math.abs(s.vrx) +
        Math.abs(s.vry) +
        Math.abs(s.vrz) +
        Math.abs(s.vSquash) +
        Math.abs(s.vLift);

      if (!pointer.inside && disp < 0.008 && vel < 0.025) {
        s.rx = 0;
        s.ry = 0;
        s.rz = 0;
        s.squash = 0;
        s.lift = 0;
        s.vrx = 0;
        s.vry = 0;
        s.vrz = 0;
        s.vSquash = 0;
        s.vLift = 0;
        node.style.transform = "";
        node.style.willChange = "";
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!alive || rafId) return;
      node.style.willChange = "transform";
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = node.getBoundingClientRect();
      const nx = rect.width > 0 ? clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) : 0;
      pointer.inside = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.hasPrev = true;
      s.targetLift = 1;
      s.vrz += (nx >= 0 ? -1 : 1) * 52 * wobble;
      s.vSquash += 0.36 * wobble;
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const nx = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
      const ny = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);

      s.targetRx = -ny * tilt * 2;
      s.targetRy = nx * tilt * 2;
      s.targetLift = 1;

      if (pointer.hasPrev) {
        const dx = e.clientX - pointer.x;
        const dy = e.clientY - pointer.y;
        const torque = clamp(dx * 0.45 - dy * 0.15, -44, 44);
        s.vrz += torque * wobble;
        s.vSquash += clamp(Math.hypot(dx, dy) * 0.004, 0, 0.16) * wobble;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.hasPrev = true;
      pointer.inside = true;
      wake();
    };

    const onDown = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const nx = rect.width > 0 ? clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) : 0;
      s.vSquash += 0.68 * wobble;
      s.vrz += (nx >= 0 ? 1 : -1) * 64 * wobble;
      s.vrx += 18 * wobble;
      wake();
    };

    const onLeave = () => {
      pointer.inside = false;
      pointer.hasPrev = false;
      s.vrz -= s.ry * 2.8 * wobble;
      s.targetRx = 0;
      s.targetRy = 0;
      s.targetLift = 0;
      wake();
    };

    let io: IntersectionObserver | null = null;
    if (impulseOnView) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !didViewWobble) {
              didViewWobble = true;
              const sign = Math.round(entry.boundingClientRect.left + entry.boundingClientRect.top) % 2 === 0 ? 1 : -1;
              s.vrz += sign * 40 * wobble;
              s.vSquash += 0.3 * wobble;
              wake();
              io?.disconnect();
              break;
            }
          }
        },
        { threshold: 0.3 }
      );
      io.observe(node);
    }

    node.addEventListener("pointerenter", onEnter);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerdown", onDown);
    node.addEventListener("pointerleave", onLeave);

    return () => {
      alive = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      io?.disconnect();
      node.removeEventListener("pointerenter", onEnter);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerdown", onDown);
      node.removeEventListener("pointerleave", onLeave);
      node.style.transform = "";
      node.style.willChange = "";
    };
  }, [tilt, wobble, perspective, impulseOnView]);

  const Component = as;
  const combinedClass = className ? `wobble-card ${className}` : "wobble-card";

  return (
    <Component
      ref={rootRef as React.Ref<HTMLDivElement>}
      className={combinedClass}
      style={style}
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </Component>
  );
}

