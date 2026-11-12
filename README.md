# Rishabh Vishwakarma — Portfolio

Full-stack and Windows systems engineering portfolio showcasing native Desktop/Win32 integrations, durable AI DAG pipelines, and production web applications.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack, static/SSG routes) & React 19
- **Language & Styling**: TypeScript 5, Tailwind CSS v4, custom OKLCH design tokens (`src/app/tokens.css`)
- **Typography**: Rethink Sans, EB Garamond (italic display contrast), JetBrains Mono
- **Motion & Physics**: GSAP (`ScrollTrigger`, `Flip`), Lenis smooth scrolling, custom HTML5 `<canvas>` spring/particle solvers
- **UI Primitives**: React Bits (`SpotlightCard`, `CountUp`, `DecryptedText`) installed via `@react-bits` + `lucide-react`
- **Package Manager**: Bun (`bun@1.3.10`)

## Routes

| Route | Description |
| --- | --- |
| `/` | Kinetic hero with interactive canvas companion ("Kibo"), selected works with hover live-capture preview, Hooke's-law draggable divider, pinned horizontal showcase, work principles, metrics, and FAQ |
| `/work` | Full 8-project catalog filterable across Systems, AI, Full-Stack SaaS, and Mobile/Web with GSAP `Flip` layout transitions |
| `/work/[slug]` | Static-generated case studies featuring pinned architecture walkthroughs, engineering notes, and module inventories |
| `/resume` | Formatted web resume paired with a printable multi-page PDF at [`public/resume.pdf`](./public/resume.pdf) |
| `/contact` | Direct email copy action, social links, and availability details |

## Interactive & Motion Components

- [`PageLoader.tsx`](./src/components/PageLoader.tsx) — Numeric progress counter (`00` → `100`) and symmetric bi-fold shutter opening on first visit
- [`Hero.tsx`](./src/components/Hero.tsx) & [`MascotCompanion.tsx`](./src/components/MascotCompanion.tsx) — Looping domain headline switcher, multi-plane ScrollTrigger parallax, and an interactive Retina `<canvas>` bot reacting to pointer tracking, shakes (`dizzy`), pokes, and CTA hovers across 8 expressions with an animated typewriter thought cloud
- [`PhysicsField.tsx`](./src/components/PhysicsField.tsx) — Background lattice field with damped cursor inertia, click ripple wavefronts, and scroll wake
- [`SignalString.tsx`](./src/components/SignalString.tsx) — Draggable quadratic SVG bezier divider with spring tension and chromatic overshoot
- [`WobbleCard.tsx`](./src/components/WobbleCard.tsx) — Reusable second-order harmonic spring 3D tilt and volume-conserving squash-and-stretch wrapper paired with [`SpotlightCard.tsx`](./src/components/SpotlightCard.tsx)
- [`HomeSections.tsx`](./src/components/HomeSections.tsx) — Cursor-tracked floating project preview, counter-scrolling capability marquee, viewport-fitted pinned horizontal showcase (`..live captures`), scrollable experience timeline, and [`CountUp`](./src/components/CountUp.tsx) metrics

## Featured Projects (`src/data/projects.ts`)

| # | Project | Summary | Core Stack |
| --- | --- | --- | --- |
| 01 | [Arcix](https://github.com/rpxexe/Arcix) | WebRTC remote desktop with native C# Win32 `SendInput` injection | Electron 34, WebRTC, WebSocket, C# Win32 |
| 02 | [Arcwire](https://github.com/rpxexe/Arcwire) | Zero-cloud encrypted Windows LAN messenger on SQLite WAL | Electron 34, TLS 1.3, Ed25519, Windows DPAPI |
| 03 | [BrainFlow](https://github.com/rpxexe/brainflow) | Visual DAG AI workflow automation engine with async execution | Next.js 16, ReactFlow, Inngest, tRPC, Prisma |
| 04 | [AssetsVista](https://github.com/rpxexe/AssetsVista) | IT Asset Management with dry-run Excel imports and atomic offboarding | Next.js 16, MongoDB, Mongoose, TanStack Query |
| 05 | [Hateable](https://github.com/rpxexe/hateable) | AI code-generation workspace inside isolated E2B sandboxes | Next.js, E2B Code Interpreter, Inngest AgentKit |
| 06 | [KalaConnect](https://github.com/rpxexe/kalaconnect) | Artisan & NGO marketplace backend with Gemini cataloging | Java Android, PostgreSQL, Google Gemini API |
| 07 | [Avodah Group](https://github.com/rpxexe/avodah-group) | Multi-vertical corporate platform with Three.js architectural canvas | Next.js, Three.js, Framer Motion, PostgreSQL |
| 08 | [TaskPulse](https://github.com/rpxexe/Task-Management-Tool) | Type-safe task management workspace on Neon Postgres & Better Auth | Next.js 16, Neon PostgreSQL, Prisma 7, Better Auth |

## Directory Layout

```text
src/
├── app/
│   ├── tokens.css        # OKLCH palette, fluid type & spacing tokens
│   ├── base.css          # Reset, typography & reduced-motion guards
│   ├── globals.css       # Component & section layout styles
│   ├── layout.tsx        # Root fonts, smooth scroll, navbar & footer
│   ├── page.tsx          # Homepage entry
│   ├── work/             # Catalog & /work/[slug] case studies
│   ├── resume/           # Web resume route
│   └── contact/          # Contact inquiry route
├── components/           # Motion, physics, navigation & React Bits primitives
└── data/                 # Structured profile & project definitions
public/
├── projects/             # 16:10 desktop UI captures
└── resume.pdf            # Downloadable PDF resume
```

## Local Development

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

### Verification Commands

```bash
bun run lint
bun run build
bun run start
```
