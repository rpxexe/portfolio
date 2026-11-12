"use client";

import { useEffect, useRef } from "react";

/** Interactive tensioned string governed by Hooke's law (F = -kx - cv). */
export function SignalString() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const REST_Y = 28;
    let apexX = 600;
    let apexY = REST_Y;
    let velocityY = 0;
    let isPulling = false;
    let lastClientY = 0;
    let lastMoveTime = performance.now();
    let pointerVelocityY = 0;
    let rafId = 0;
    let lastFrameTime = performance.now();

    const applyPath = (x: number, y: number) => {
      path.setAttribute("d", `M 0 ${REST_Y} Q ${x.toFixed(1)} ${y.toFixed(1)} 1200 ${REST_Y}`);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      if (!isPulling) {
        // Real damped harmonic oscillator: F = -k * displacement - c * velocity
        const stiffness = 310;
        const damping = 5.2;
        const displacement = apexY - REST_Y;
        const accelY = -stiffness * displacement - damping * velocityY;
        velocityY += accelY * dt;
        apexY += velocityY * dt;

        // Drift lateral control node softly back to midpoint while oscillating
        apexX += (600 - apexX) * Math.min(1, 5 * dt);

        const energy = Math.abs(apexY - REST_Y) + Math.abs(velocityY) * 0.035;
        path.style.stroke = energy > 2.5 ? "var(--color-accent)" : "";
        applyPath(apexX, apexY);

        if (Math.abs(apexY - REST_Y) < 0.12 && Math.abs(velocityY) < 0.4) {
          apexX = 600;
          apexY = REST_Y;
          velocityY = 0;
          path.style.stroke = "";
          applyPath(600, REST_Y);
          rafId = 0;
          return;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (!rafId) {
        lastFrameTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const bendTo = (clientX: number, clientY: number) => {
      const rect = wrap.getBoundingClientRect();
      const u = Math.max(0.04, Math.min(0.96, (clientX - rect.left) / rect.width));
      apexX = u * 1200;

      // Clamped-string compliance profile: peak flex at center, stiffer toward pins
      const compliance = 0.45 + 0.55 * Math.sin(Math.PI * u);
      const offsetFromMid = clientY - (rect.top + rect.height / 2);
      const nextY = Math.max(-130, Math.min(186, REST_Y + offsetFromMid * 2.3 * compliance));

      const now = performance.now();
      const dt = Math.max(0.008, (now - lastMoveTime) / 1000);
      pointerVelocityY = Math.max(-1400, Math.min(1400, ((clientY - lastClientY) / dt) * 1.1));
      lastClientY = clientY;
      lastMoveTime = now;

      apexY = nextY;
      velocityY = 0;
      path.style.stroke = "var(--color-accent)";
      applyPath(apexX, apexY);
    };

    const onPointerEnter = (e: PointerEvent) => {
      isPulling = true;
      lastClientY = e.clientY;
      lastMoveTime = performance.now();
      bendTo(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      isPulling = true;
      bendTo(e.clientX, e.clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      isPulling = true;
      lastClientY = e.clientY;
      lastMoveTime = performance.now();
      wrap.setPointerCapture?.(e.pointerId);
      bendTo(e.clientX, e.clientY);
    };

    const releaseString = (e?: PointerEvent) => {
      if (e && wrap.hasPointerCapture?.(e.pointerId)) {
        wrap.releasePointerCapture(e.pointerId);
      }
      if (!isPulling) return;
      isPulling = false;
      velocityY = pointerVelocityY;
      pointerVelocityY = 0;
      ensureLoop();
    };

    wrap.addEventListener("pointerenter", onPointerEnter);
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointerup", releaseString);
    wrap.addEventListener("pointercancel", releaseString);
    wrap.addEventListener("pointerleave", releaseString);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      wrap.removeEventListener("pointerenter", onPointerEnter);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointerup", releaseString);
      wrap.removeEventListener("pointercancel", releaseString);
      wrap.removeEventListener("pointerleave", releaseString);
    };
  }, []);

  return (
    <div ref={wrapRef} className="signal-wire" aria-hidden="true">
      <svg viewBox="0 0 1200 56" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M 0 28 Q 600 28 1200 28"
          fill="none"
          stroke="var(--color-rule-2)"
          strokeWidth="2"
        />
        <circle cx="3" cy="28" r="3" fill="var(--color-accent)" />
        <circle cx="1197" cy="28" r="3" fill="var(--color-cool)" />
      </svg>
    </div>
  );
}
