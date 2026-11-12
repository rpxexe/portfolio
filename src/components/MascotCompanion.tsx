"use client";

import { useEffect, useRef, useState } from "react";

export type MascotMood =
  | "curious"
  | "happy"
  | "love"
  | "wink"
  | "focused"
  | "surprised"
  | "dizzy"
  | "sleepy";

const MOOD_THOUGHTS: Record<MascotMood, string[]> = {
  curious: ["Looking around...", "Ooh, what shall we build?", "Tracking your cursor!"],
  happy: ["8 systems shipped!", "Zero shortcuts taken.", "Ready when you are!"],
  love: ["Check out Arcix & BrainFlow!", "Let's ship something awesome!", "Clean craft, fast execution!"],
  wink: ["Full-stack & native Win32 ;)", "TypeScript all the way down!", "No cloud lock-in here."],
  focused: ["Compiling Win32 hooks...", "Sorting Inngest DAGs...", "Tuning latency budgets..."],
  surprised: ["Whoa!! That tickled!", "Hey!! Watch the antennae!", "Critical bounce hit!"],
  dizzy: ["Whoa... spinning fast!!", "Too much cursor momentum!", "Need a moment to settle..."],
  sleepy: ["Idling in daemon mode...", "Wake me on scroll...", "Recharging qubits..."],
};

const AUTO_CYCLE: MascotMood[] = ["curious", "happy", "wink", "love", "focused", "sleepy"];

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  kind: "dot" | "heart" | "star" | "zzz";
  size: number;
  color: string;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

export function MascotCompanion({
  externalMood,
}: {
  externalMood?: MascotMood | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [autoMoodIdx, setAutoMoodIdx] = useState(0);
  const [reactionMood, setReactionMood] = useState<MascotMood | null>(null);
  const [hoveringBody, setHoveringBody] = useState(false);

  const activeMood: MascotMood =
    externalMood ?? reactionMood ?? (hoveringBody ? "love" : AUTO_CYCLE[autoMoodIdx]);

  const activeMoodRef = useRef<MascotMood>(activeMood);
  const hoveringRef = useRef<boolean>(hoveringBody);
  const pokeRef = useRef<(() => void) | null>(null);
  const reactionTimerRef = useRef<number | null>(null);

  // Sync refs outside render
  useEffect(() => {
    activeMoodRef.current = activeMood;
    hoveringRef.current = hoveringBody;
  }, [activeMood, hoveringBody]);

  // Autonomous organic expression loop every 3.8s when user is not actively hovering
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!hoveringRef.current) {
        setAutoMoodIdx((prev) => (prev + 1) % AUTO_CYCLE.length);
      }
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const width = 560;
    const height = 440;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pointer = { nx: 0, ny: 0, prevX: 0, speedAccum: 0, lastAt: performance.now() };

    const phys = {
      bobPhase: 0,
      jumpY: 0,
      jumpVy: 0,
      scaleY: 1,
      scaleVy: 0,
      tilt: 0,
      tiltV: 0,
      eyeX: 0,
      eyeY: 0,
      earOffset: 0,
      earV: 0,
      blink: 0,
      nextBlinkAt: 2.0,
      blush: 0,
      ambientTimer: 0,
      cloudY: 0,
      cloudVy: 0,
      cloudScale: 1,
      cloudScaleV: 0,
      thoughtChars: 99,
      lastThoughtText: MOOD_THOUGHTS.curious[0],
      lastMood: "curious" as MascotMood,
      phraseTick: 0,
      dizzyAngle: 0,
    };

    const sparks: SparkParticle[] = [];

    const spawnBurst = (cx: number, cy: number, count: number, kind: SparkParticle["kind"]) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
        const speed = kind === "zzz" ? 18 + Math.random() * 14 : 62 + Math.random() * 96;
        sparks.push({
          x: cx + (kind === "zzz" ? 36 : 0),
          y: cy + (kind === "zzz" ? -56 : 0),
          vx: kind === "zzz" ? 10 + Math.random() * 10 : Math.cos(angle) * speed,
          vy: kind === "zzz" ? -26 - Math.random() * 14 : Math.sin(angle) * speed - 34,
          life: 0,
          maxLife: kind === "zzz" ? 1.5 : 0.78 + Math.random() * 0.35,
          kind,
          size: kind === "heart" || kind === "star" ? 7 : kind === "zzz" ? 13 : 3 + Math.random() * 2,
          color: kind === "heart" ? "#ff7ca8" : i % 2 === 0 ? "#3ce8b2" : "#5cc6e8",
        });
      }
    };

    pokeRef.current = () => {
      phys.jumpVy = -270;
      phys.scaleY = 0.78;
      phys.scaleVy = 1.9;
      phys.earV = -20;
      phys.tiltV = (Math.random() > 0.5 ? 1 : -1) * 2.4;
      phys.cloudScale = 0.86;
      phys.cloudScaleV = 2.6;
      spawnBurst(width / 2, height * 0.62, 10, "star");
    };

    const onWindowMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.58;
      const dx = (e.clientX - cx) / Math.max(220, rect.width * 0.65);
      const dy = (e.clientY - cy) / Math.max(200, rect.height * 0.65);
      pointer.nx = Math.max(-1, Math.min(1, dx));
      pointer.ny = Math.max(-1, Math.min(1, dy));

      // Detect rapid cursor shaking over mascot to trigger playful dizzy reaction
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      const now = performance.now();
      const dtMove = Math.max(10, now - pointer.lastAt);
      pointer.lastAt = now;
      if (inside) {
        const vx = Math.abs(e.clientX - pointer.prevX) / dtMove;
        pointer.speedAccum = pointer.speedAccum * 0.85 + vx * 0.35;
        if (pointer.speedAccum > 1.8 && activeMoodRef.current !== "dizzy") {
          pointer.speedAccum = 0;
          setReactionMood("dizzy");
          phys.jumpVy = -140;
          if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
          reactionTimerRef.current = window.setTimeout(() => setReactionMood(null), 1900);
        }
      } else {
        pointer.speedAccum *= 0.8;
      }
      pointer.prevX = e.clientX;
    };

    window.addEventListener("pointermove", onWindowMove, { passive: true });

    let rafId = 0;
    let last = performance.now();

    const drawHeart = (x: number, y: number, s: number, alpha: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.36);
      ctx.bezierCurveTo(-s * 0.95, -s * 0.35, -s * 0.55, -s * 1.15, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.55, -s * 1.15, s * 0.95, -s * 0.35, 0, s * 0.36);
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (x: number, y: number, r: number, alpha: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * (r * 0.36), Math.sin(a + Math.PI / 4) * (r * 0.36));
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawThoughtCloud = (
      mood: MascotMood,
      headX: number,
      headY: number,
      text: string,
      visibleCount: number
    ) => {
      const shown = text.slice(0, Math.floor(visibleCount));
      ctx.save();
      ctx.font = "500 13.5px 'JetBrains Mono', ui-monospace, monospace";
      const textWidth = Math.max(90, ctx.measureText(text).width);
      const padX = 18;
      const bubbleW = Math.min(340, textWidth + padX * 2);
      const bubbleH = 42;
      const bx = headX - bubbleW / 2;
      const by = Math.max(14, headY - 158 + phys.cloudY);

      // Trailing spring-lagging thought puffs connecting Kibo's antenna to cloud
      const puffAlpha = 0.85;
      ctx.fillStyle = "#161d26";
      ctx.strokeStyle = mood === "love" ? "rgba(255, 124, 168, 0.45)" : "rgba(60, 232, 178, 0.38)";
      ctx.lineWidth = 1.4;

      ctx.beginPath();
      ctx.arc(headX + 22, headY - 104 + phys.cloudY * 0.5, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(headX + 12, headY - 118 + phys.cloudY * 0.75, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cloud main soft rounded pill with subtle bumpy cloud silhouettes
      const centerBx = bx + bubbleW / 2;
      const centerBy = by + bubbleH / 2;
      ctx.translate(centerBx, centerBy);
      ctx.scale(phys.cloudScale, phys.cloudScale);
      ctx.translate(-centerBx, -centerBy);

      ctx.globalAlpha = puffAlpha;
      const cloudGrad = ctx.createLinearGradient(bx, by, bx, by + bubbleH);
      cloudGrad.addColorStop(0, "#19222d");
      cloudGrad.addColorStop(1, "#10161e");
      drawRoundedRectPath(ctx, bx, by, bubbleW, bubbleH, 21);
      ctx.fillStyle = cloudGrad;
      ctx.fill();
      ctx.strokeStyle = mood === "love" ? "rgba(255, 124, 168, 0.52)" : "rgba(60, 232, 178, 0.48)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Subtle glowing dot indicator + animated typewriter text
      ctx.globalAlpha = 1;
      ctx.fillStyle = mood === "love" ? "#ff7ca8" : mood === "focused" ? "#5cc6e8" : "#3ce8b2";
      ctx.beginPath();
      ctx.arc(bx + 15, by + bubbleH / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#eef5fa";
      ctx.textBaseline = "middle";
      const displayStr = visibleCount < text.length ? `${shown}_` : shown;
      ctx.fillText(displayStr, bx + 25, by + bubbleH / 2 + 0.5);
      ctx.restore();
    };

    const renderFrame = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;

      const mood = activeMoodRef.current;

      if (mood !== phys.lastMood) {
        phys.lastMood = mood;
        phys.phraseTick = (phys.phraseTick + 1) % MOOD_THOUGHTS[mood].length;
        phys.lastThoughtText = MOOD_THOUGHTS[mood][phys.phraseTick];
        phys.thoughtChars = 0;
        phys.cloudScale = 0.85;
        phys.cloudScaleV = 3.2;
        if (mood === "love") spawnBurst(width / 2, height * 0.54, 6, "heart");
        if (mood === "happy" || mood === "wink") spawnBurst(width / 2, height * 0.54, 5, "star");
      }

      if (!reduced) {
        phys.bobPhase += dt * (mood === "sleepy" ? 1.45 : mood === "happy" || mood === "love" ? 3.8 : 2.3);
        phys.dizzyAngle += dt * 7.5;

        // Typewriter reveal for thought cloud
        if (phys.thoughtChars < phys.lastThoughtText.length) {
          phys.thoughtChars = Math.min(phys.lastThoughtText.length, phys.thoughtChars + dt * 42);
        }

        // Jump & area-conserving squash-stretch spring
        phys.jumpVy += (-220 * phys.jumpY - 15 * phys.jumpVy) * dt;
        phys.jumpY += phys.jumpVy * dt;

        phys.scaleVy += (290 * (1 - phys.scaleY) - 12 * phys.scaleVy) * dt;
        phys.scaleY += phys.scaleVy * dt;

        // Cloud vertical spring lagging behind Kibo's jump
        const cloudTargetY = phys.jumpY * 0.35 + Math.sin(phys.bobPhase - 0.6) * 4;
        phys.cloudVy += (180 * (cloudTargetY - phys.cloudY) - 11 * phys.cloudVy) * dt;
        phys.cloudY += phys.cloudVy * dt;

        phys.cloudScaleV += (240 * (1 - phys.cloudScale) - 12 * phys.cloudScaleV) * dt;
        phys.cloudScale += phys.cloudScaleV * dt;

        // Head tilt spring tracking pointer
        const targetTilt =
          mood === "sleepy"
            ? -0.07
            : mood === "wink"
              ? 0.09
              : mood === "dizzy"
                ? Math.sin(phys.bobPhase * 2) * 0.12
                : pointer.nx * 0.085;
        phys.tiltV += (160 * (targetTilt - phys.tilt) - 14 * phys.tiltV) * dt;
        phys.tilt += phys.tiltV * dt;

        // Eye look tracking spring
        const targetEyeX = mood === "sleepy" ? 0 : pointer.nx * 10;
        const targetEyeY = mood === "sleepy" ? 4 : pointer.ny * 7;
        phys.eyeX += (targetEyeX - phys.eyeX) * Math.min(1, 14 * dt);
        phys.eyeY += (targetEyeY - phys.eyeY) * Math.min(1, 14 * dt);

        // Ear lag spring
        const targetEar = mood === "sleepy" ? 11 : mood === "surprised" ? -10 : phys.jumpVy * 0.032;
        phys.earV += (220 * (targetEar - phys.earOffset) - 10 * phys.earV) * dt;
        phys.earOffset += phys.earV * dt;

        const targetBlush =
          mood === "love" ? 1 : mood === "happy" || mood === "dizzy" ? 0.85 : mood === "wink" ? 0.55 : 0.25;
        phys.blush += (targetBlush - phys.blush) * Math.min(1, 8 * dt);

        phys.nextBlinkAt -= dt;
        if (phys.nextBlinkAt <= 0 && mood !== "happy" && mood !== "sleepy" && mood !== "love") {
          phys.blink = 1;
          phys.nextBlinkAt = 2.4 + Math.random() * 2.5;
        }
        if (phys.blink > 0) phys.blink = Math.max(0, phys.blink - dt * 7.2);

        phys.ambientTimer -= dt;
        if (phys.ambientTimer <= 0) {
          if (mood === "love" || mood === "happy") {
            spawnBurst(width / 2 + (Math.random() - 0.5) * 95, height * 0.48, 1, "heart");
            phys.ambientTimer = 0.55;
          } else if (mood === "sleepy") {
            spawnBurst(width / 2, height * 0.56, 1, "zzz");
            phys.ambientTimer = 0.9;
          } else if (mood === "focused") {
            spawnBurst(width / 2 + (Math.random() - 0.5) * 110, height * 0.5, 1, "star");
            phys.ambientTimer = 0.7;
          } else {
            phys.ambientTimer = 0.45;
          }
        }
      } else {
        phys.blush = 0.45;
        phys.thoughtChars = phys.lastThoughtText.length;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const breathOffset = reduced ? 0 : Math.sin(phys.bobPhase) * (mood === "happy" ? 8 : 5);
      const cy = height * 0.62 + breathOffset + phys.jumpY;

      // Ground soft emerald-cyan aura ellipse under floating mascot
      const shadowScale = Math.max(0.7, 1 - Math.abs(breathOffset + phys.jumpY) * 0.008);
      const auraGrad = ctx.createRadialGradient(cx, height - 30, 8, cx, height - 30, 130 * shadowScale);
      auraGrad.addColorStop(
        0,
        mood === "love" ? "rgba(255, 124, 168, 0.24)" : mood === "happy" ? "rgba(60, 232, 178, 0.28)" : "rgba(92, 198, 232, 0.2)"
      );
      auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(cx, height - 30, 130 * shadowScale, 22 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Volume conservation squash & stretch
      const scaleY = phys.scaleY;
      const scaleX = 1 / Math.max(0.75, scaleY);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(phys.tilt);
      ctx.scale(scaleX, scaleY);

      const accent =
        mood === "love" ? "#ff7ca8" : mood === "happy" ? "#3ce8b2" : mood === "focused" ? "#5cc6e8" : "#4ae0bf";

      const leftPawY =
        mood === "surprised"
          ? -30
          : mood === "happy" || mood === "love"
            ? 14 - Math.abs(Math.sin(phys.bobPhase * 1.4)) * 18
            : mood === "wink"
              ? 8
              : 32;
      const rightPawY =
        mood === "surprised"
          ? -30
          : mood === "happy" || mood === "love"
            ? 14 - Math.abs(Math.cos(phys.bobPhase * 1.4)) * 18
            : 32;

      const drawPaw = (px: number, py: number, side: number) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(side * (mood === "happy" || mood === "love" ? 0.36 : 0.14));
        const pGrad = ctx.createLinearGradient(0, -16, 0, 16);
        pGrad.addColorStop(0, "#242c37");
        pGrad.addColorStop(1, "#12171e");
        ctx.fillStyle = pGrad;
        ctx.strokeStyle = "rgba(92, 198, 232, 0.34)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };
      drawPaw(-118, leftPawY, -1);
      drawPaw(118, rightPawY, 1);

      const drawEar = (side: -1 | 1) => {
        ctx.save();
        ctx.translate(side * 66, -72 + phys.earOffset * 0.45);
        ctx.rotate(side * (0.28 + phys.earOffset * 0.015));

        const earGrad = ctx.createLinearGradient(0, -44, 0, 14);
        earGrad.addColorStop(0, "#232d3a");
        earGrad.addColorStop(1, "#131820");
        ctx.fillStyle = earGrad;
        ctx.strokeStyle = mood === "love" ? "rgba(255, 124, 168, 0.45)" : "rgba(60, 232, 178, 0.38)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-22, 12);
        ctx.quadraticCurveTo(-8, -42, 0, -44);
        ctx.quadraticCurveTo(10, -42, 22, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = mood === "love" ? "rgba(255, 124, 168, 0.72)" : mood === "happy" ? "rgba(60, 232, 178, 0.75)" : "rgba(92, 198, 232, 0.55)";
        ctx.beginPath();
        ctx.moveTo(-9, 3);
        ctx.quadraticCurveTo(0, -25, 9, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
      drawEar(-1);
      drawEar(1);

      // Ceramic rounded chassis
      const bodyGrad = ctx.createRadialGradient(-28, -56, 18, 0, 0, 138);
      bodyGrad.addColorStop(0, "#262f3b");
      bodyGrad.addColorStop(0.55, "#151a22");
      bodyGrad.addColorStop(1, "#0d1016");
      drawRoundedRectPath(ctx, -104, -84, 208, 168, 66);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      ctx.lineWidth = 2;
      const rimGrad = ctx.createLinearGradient(0, -84, 0, 84);
      rimGrad.addColorStop(0, mood === "love" ? "rgba(255, 180, 205, 0.55)" : "rgba(168, 243, 219, 0.45)");
      rimGrad.addColorStop(0.5, "rgba(60, 232, 178, 0.16)");
      rimGrad.addColorStop(1, "rgba(92, 198, 232, 0.22)");
      ctx.strokeStyle = rimGrad;
      ctx.stroke();

      ctx.fillStyle = "rgba(235, 245, 255, 0.08)";
      ctx.beginPath();
      ctx.ellipse(-28, -68, 36, 6, -0.18, 0, Math.PI * 2);
      ctx.fill();

      // OLED visor
      drawRoundedRectPath(ctx, -82, -52, 164, 106, 40);
      ctx.fillStyle = "#080b10";
      ctx.fill();
      ctx.strokeStyle = mood === "love" ? "rgba(255, 124, 168, 0.28)" : "rgba(60, 232, 178, 0.22)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      if (phys.blush > 0.05) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 132, 168, ${(0.4 * phys.blush).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(-48, 22, 14, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(48, 22, 14, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const blinkScale = 1 - Math.sin(phys.blink * Math.PI) * 0.92;
      const drawEye = (ex: number, ey: number, side: -1 | 1) => {
        ctx.save();
        ctx.translate(ex + phys.eyeX * 0.5, ey + phys.eyeY * 0.5);

        if (mood === "happy" || (mood === "wink" && side === -1)) {
          ctx.strokeStyle = "#3ce8b2";
          ctx.lineWidth = 5.5;
          ctx.lineCap = "round";
          ctx.shadowColor = "rgba(60, 232, 178, 0.55)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 6, 13, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        } else if (mood === "love") {
          ctx.shadowColor = "#ff7ca8";
          ctx.shadowBlur = 12;
          drawHeart(0, 2, 15, 1, "#ff7ca8");
        } else if (mood === "dizzy") {
          ctx.strokeStyle = "#5cc6e8";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.rotate(side * phys.dizzyAngle);
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 3.4; a += 0.25) {
            const rad = 1.5 + a * 1.3;
            const px = Math.cos(a) * rad;
            const py = Math.sin(a) * rad;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        } else if (mood === "sleepy") {
          ctx.strokeStyle = "#5cc6e8";
          ctx.lineWidth = 4.2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(0, -2, 12, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
        } else {
          ctx.scale(1, blinkScale);
          const eyeW = mood === "surprised" ? 16 : 14;
          const eyeH = mood === "surprised" ? 21 : mood === "focused" ? 13 : 18;

          ctx.shadowColor = accent;
          ctx.shadowBlur = 12;
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.ellipse(0, 0, eyeW, eyeH, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = "#08121a";
          ctx.beginPath();
          ctx.ellipse(phys.eyeX * 0.28, phys.eyeY * 0.28, eyeW * 0.5, eyeH * 0.52, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#eef9ff";
          ctx.beginPath();
          ctx.arc(-4 + phys.eyeX * 0.25, -5 + phys.eyeY * 0.22, mood === "surprised" ? 5.2 : 4.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(238, 249, 255, 0.72)";
          ctx.beginPath();
          ctx.arc(4 + phys.eyeX * 0.25, 5 + phys.eyeY * 0.22, 2.1, 0, Math.PI * 2);
          ctx.fill();

          if (mood === "focused") {
            ctx.strokeStyle = "#080b10";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(-17, -11);
            ctx.lineTo(17, ex < 0 ? -7 : -15);
            ctx.stroke();
          }
        }

        ctx.restore();
      };

      drawEye(-36, -4, -1);
      drawEye(36, -4, 1);

      // Mouth expression
      ctx.save();
      ctx.translate(phys.eyeX * 0.28, 22 + phys.eyeY * 0.22);
      ctx.strokeStyle = mood === "love" ? "#ffb3cb" : "#a8f3db";
      ctx.fillStyle = mood === "love" ? "#ff7ca8" : "#3ce8b2";
      ctx.lineWidth = 2.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (mood === "happy" || mood === "love") {
        ctx.beginPath();
        ctx.arc(0, -1, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.closePath();
        ctx.fill();
      } else if (mood === "wink") {
        // Playful grin + tiny pink blep tongue
        ctx.beginPath();
        ctx.arc(0, -1, 9, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "#ff7ca8";
        ctx.beginPath();
        ctx.arc(2, 6, 4.2, 0, Math.PI);
        ctx.fill();
      } else if (mood === "surprised") {
        ctx.beginPath();
        ctx.ellipse(0, 2, 5.5, 7.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (mood === "dizzy") {
        ctx.beginPath();
        ctx.moveTo(-9, 2);
        ctx.quadraticCurveTo(-4, -3, 0, 2);
        ctx.quadraticCurveTo(4, 6, 9, 1);
        ctx.stroke();
      } else if (mood === "focused") {
        ctx.beginPath();
        ctx.moveTo(-8, 1);
        ctx.lineTo(8, 1);
        ctx.stroke();
      } else if (mood === "sleepy") {
        ctx.beginPath();
        ctx.arc(0, 2, 3.8, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(-5.5, -1, 5.5, 0.1 * Math.PI, 0.95 * Math.PI);
        ctx.arc(5.5, -1, 5.5, 0.05 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore();

      // Animated speech/thought cloud connected right above Kibo
      drawThoughtCloud(mood, cx, cy, phys.lastThoughtText, phys.thoughtChars);

      // Update and render sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life += dt;
        if (sp.life >= sp.maxLife) {
          sparks.splice(i, 1);
          continue;
        }
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        const t = sp.life / sp.maxLife;
        const alpha = (1 - t) * (1 - t);

        if (sp.kind === "heart") {
          drawHeart(sp.x, sp.y, sp.size, alpha, sp.color);
        } else if (sp.kind === "star") {
          drawStar(sp.x, sp.y, sp.size, alpha, sp.color);
        } else if (sp.kind === "zzz") {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "#5cc6e8";
          ctx.font = `600 ${Math.round(sp.size + t * 5)}px var(--font-display), sans-serif`;
          ctx.fillText("z", sp.x, sp.y);
          ctx.restore();
        } else {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = sp.color;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (!reduced) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    if (reduced) {
      renderFrame(performance.now());
    } else {
      rafId = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onWindowMove);
      if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
      pokeRef.current = null;
    };
  }, []);

  function handlePoke() {
    pokeRef.current?.();
    const order: MascotMood[] = ["surprised", "love", "wink", "happy"];
    const next = order[(order.indexOf(activeMood) + 1) % order.length];
    setReactionMood(next);
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => setReactionMood(null), 2000);
  }

  return (
    <div className="mascot-stage">
      <button
        type="button"
        className="mascot-canvas-btn"
        aria-label={`Poke Kibo mascot, currently feeling ${activeMood}`}
        onPointerEnter={() => setHoveringBody(true)}
        onPointerLeave={() => setHoveringBody(false)}
        onClick={handlePoke}
      >
        <canvas ref={canvasRef} className="mascot-canvas" />
      </button>
    </div>
  );
}
