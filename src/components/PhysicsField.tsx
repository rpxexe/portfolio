"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  r: number;
}

export function PhysicsField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(2, window.devicePixelRatio || 1);

    const particles: Particle[] = [];
    const COUNT = width < 768 ? 16 : 30;

    function seedParticles() {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        // Deterministic spatial lattice with slight organic offset
        const cols = width < 768 ? 4 : 6;
        const rows = Math.ceil(COUNT / cols);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const jitterX = (((i * 73) % 100) / 100 - 0.5) * (width / cols) * 0.6;
        const jitterY = (((i * 41) % 100) / 100 - 0.5) * (height / rows) * 0.6;
        const hx = ((col + 0.5) / cols) * width + jitterX;
        const hy = ((row + 0.5) / rows) * height + jitterY;
        particles.push({
          x: hx,
          y: hy,
          homeX: hx,
          homeY: hy,
          vx: 0,
          vy: 0,
          r: i % 3 === 0 ? 1.8 : 1.2,
        });
      }
    }

    function resize() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    }

    resize();

    // Spring-damper cursor state (real Hooke's law + viscous damping)
    const pointer = {
      targetX: width * 0.6,
      targetY: height * 0.4,
      x: width * 0.6,
      y: height * 0.4,
      vx: 0,
      vy: 0,
      active: false,
    };

    interface RippleWave {
      x: number;
      y: number;
      radius: number;
      speed: number;
      strength: number;
    }

    const ripples: RippleWave[] = [];
    let lastScrollY = window.scrollY;
    let scrollImpulseY = 0;

    const onMove = (e: PointerEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
    };

    const onDown = (e: PointerEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 8,
        speed: 440,
        strength: 1,
      });
      if (ripples.length > 4) ripples.shift();
    };

    const onScroll = () => {
      const nextY = window.scrollY;
      const dy = nextY - lastScrollY;
      lastScrollY = nextY;
      scrollImpulseY = Math.max(-420, Math.min(420, scrollImpulseY - dy * 2.4));
    };

    const onLeave = () => {
      pointer.active = false;
    };

    if (finePointer && !prefersReduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    if (!prefersReduced) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", resize);

    let rafId = 0;
    let lastTime = performance.now();

    function drawFrame(now: number) {
      if (!ctx) return;
      const dt = Math.min(0.032, (now - lastTime) / 1000);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      if (!prefersReduced) {
        // Spring-damper cursor inertia: F = k*(target - pos) - c*vel
        const stiffness = 140;
        const damping = 16;
        const ax = (pointer.targetX - pointer.x) * stiffness - pointer.vx * damping;
        const ay = (pointer.targetY - pointer.y) * stiffness - pointer.vy * damping;
        pointer.vx += ax * dt;
        pointer.vy += ay * dt;
        pointer.x += pointer.vx * dt;
        pointer.y += pointer.vy * dt;

        // Decay scroll drag impulse smoothly
        scrollImpulseY *= Math.max(0, 1 - 6.5 * dt);

        // Advance expanding acoustic ripples
        for (let w = ripples.length - 1; w >= 0; w--) {
          const wave = ripples[w];
          wave.radius += wave.speed * dt;
          wave.strength *= Math.max(0, 1 - 1.9 * dt);
          if (wave.strength < 0.04) {
            ripples.splice(w, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(60, 232, 178, ${(wave.strength * 0.14).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      const speed = Math.hypot(pointer.vx, pointer.vy);
      const glowRadius = 210 + Math.min(90, speed * 0.08);
      const glowAlpha = pointer.active ? 0.11 : 0.05;

      // Subtle physics-damped neon cursor field
      const grad = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, glowRadius);
      grad.addColorStop(0, `rgba(60, 232, 178, ${glowAlpha})`);
      grad.addColorStop(0.5, `rgba(92, 198, 232, ${glowAlpha * 0.4})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const springK = 18;
      const nodeDamp = 5.5;
      const repelRadius = 185;
      const repelStrength = 42000;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!prefersReduced) {
          // Spring tether back to equilibrium + aerodynamic scroll wake
          let fx = (p.homeX - p.x) * springK;
          let fy = (p.homeY - p.y) * springK + scrollImpulseY * (0.45 + (p.r - 1.2) * 0.5);

          // Inverse-square repulsion/wake around cursor
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 25 && distSq < repelRadius * repelRadius) {
              const dist = Math.sqrt(distSq);
              const force = (repelStrength / distSq) * (1 - dist / repelRadius);
              fx += (dx / dist) * force * 0.15;
              fy += (dy / dist) * force * 0.15;
            }
          }

          // Wavefront pressure impulse from clicks
          for (let w = 0; w < ripples.length; w++) {
            const wave = ripples[w];
            const dx = p.x - wave.x;
            const dy = p.y - wave.y;
            const dist = Math.hypot(dx, dy);
            const band = Math.abs(dist - wave.radius);
            if (dist > 4 && band < 48) {
              const pulse = (1 - band / 48) * wave.strength * 340;
              fx += (dx / dist) * pulse;
              fy += (dy / dist) * pulse;
            }
          }

          p.vx = (p.vx + fx * dt) * Math.max(0, 1 - nodeDamp * dt);
          p.vy = (p.vy + fy * dt) * Math.max(0, 1 - nodeDamp * dt);
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        const pDist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        const energized = Math.max(0, 1 - pDist / 260);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + energized * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = energized > 0.25
          ? `rgba(60, 232, 178, ${0.22 + energized * 0.55})`
          : "rgba(155, 172, 190, 0.22)";
        ctx.fill();
      }

      // Connect energized neighboring nodes
      const maxLink = 210;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const aDist = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (aDist > 300) continue;

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxLink) {
            const alpha = (1 - d / maxLink) * (1 - aDist / 300) * 0.38;
            if (alpha > 0.02) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(60, 232, 178, ${alpha.toFixed(3)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      if (!prefersReduced) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    }

    if (prefersReduced) {
      drawFrame(performance.now());
    } else {
      rafId = window.requestAnimationFrame(drawFrame);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="physics-canvas no-print" aria-hidden="true" />;
}

