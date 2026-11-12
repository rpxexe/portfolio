export type ProjectTier = "systems" | "ai" | "fullstack" | "web";

export interface ArchitectureNode {
  id: string;
  label: string;
  role: string;
  detail: string;
  layer: "person" | "instrument";
}

export interface ProjectCaseStudy {
  slug: string;
  rank: number;
  name: string;
  tagline: string;
  category: string;
  tier: ProjectTier;
  featured: boolean;
  repoUrl: string;
  liveUrl?: string;
  screenshotPath?: string;
  screenshotAlt?: string;
  year: string;
  runtime: string;
  stack: string[];
  complexityFocus: string;
  summary: string;
  problem: string;
  architectureSummary: string;
  highlights: string[];
  modules: { path: string; responsibility: string }[];
  architectureFlow: ArchitectureNode[];
}

export const PROJECTS: ProjectCaseStudy[] = [
  {
    slug: "arcix",
    rank: 1,
    name: "Arcix",
    tagline: "WebRTC remote desktop with native C# Win32 input injection",
    category: "Systems & Desktop",
    tier: "systems",
    featured: true,
    repoUrl: "https://github.com/rpxexe/Arcix",
    liveUrl: "https://aerodesk-tau.vercel.app",
    screenshotPath: "/projects/arcix-home-desktop.png",
    screenshotAlt: "Arcix remote desktop control center interface",
    year: "2026",
    runtime: "Electron 34 + WebRTC + C# Win32",
    stack: ["Electron 34", "React 19", "TypeScript", "WebRTC (DTLS-SRTP)", "WebSocket", "C# Win32 SendInput"],
    complexityFocus: "Multi-process IPC, P2P media signaling, and OS-level input injection",
    summary:
      "Production-oriented Windows remote desktop platform inspired by AnyDesk, pairing Electron 34 and WebRTC media channels with a zero-dependency C# Win32 SendInput binary.",
    problem:
      "Browser-only remote tools cannot inject reliable OS-wide pointer and keyboard events across elevated Windows surfaces, while naive wrappers skip host consent controls.",
    architectureSummary:
      "Separates WebSocket 9-digit room signaling from DTLS 1.3 / SRTP peer media streams and SCTP control channels, forwarding authorized input payloads across Electron contextBridge to a compiled Win32 SendInput executable.",
    highlights: [
      "9-digit device addressing (XXX XXX XXX) orchestrated through a rate-limited WebSocket signaling hub on port 7070.",
      "Sub-millisecond remote mouse, scroll, and keyboard synthesis via a standalone C# Win32 SendInput executable.",
      "Granular per-session consent toggles separating view-only access, input control, clipboard sync, and chunked P2P file transfer.",
      "Host circuit breakers including persistent floating indicator, Ctrl+Alt+Shift+Escape kill-switch, and append-only JSONL audit logging.",
      "Verified end-to-end with a 26-assertion automated integration suite.",
    ],
    modules: [
      { path: "server/signaling-server.js", responsibility: "WebSocket room broker, 9-digit session pairing, and rate limiter" },
      { path: "native-input/InputInjector.cs", responsibility: "Compiled Win32 SendInput binary for cursor and keystroke synthesis" },
      { path: "electron/main.ts", responsibility: "Window lifecycle, native IPC orchestration, and emergency shortcut hook" },
      { path: "src/services/webrtc-manager.ts", responsibility: "RTCPeerConnection media negotiation and SCTP data channels" },
      { path: "logs/audit.jsonl", responsibility: "Append-only privacy-safe session audit ledger" },
    ],
    architectureFlow: [
      { id: "peer", label: "Controller UI", role: "Operator", detail: "Captures pointer/keyboard events and permissions", layer: "person" },
      { id: "sig", label: "WS Signaling :7070", role: "Broker", detail: "Pairs 9-digit IDs and ICE candidates", layer: "instrument" },
      { id: "rtc", label: "WebRTC DTLS/SRTP", role: "Transport", detail: "VP8/VP9 video stream + SCTP control channel", layer: "instrument" },
      { id: "win32", label: "C# InputInjector", role: "Native OS", detail: "Dispatches Win32 SendInput on host", layer: "instrument" },
    ],
  },
  {
    slug: "arcwire",
    rank: 2,
    name: "Arcwire",
    tagline: "Zero-cloud encrypted Windows LAN messenger on SQLite WAL",
    category: "Systems & Desktop",
    tier: "systems",
    featured: true,
    repoUrl: "https://github.com/rpxexe/Arcwire",
    year: "2026",
    runtime: "Electron 34 + TLS 1.3 + SQLite WAL",
    stack: ["Electron 34", "React 18", "TypeScript", "SQLite WAL", "Drizzle ORM", "TLS 1.3 / Ed25519", "Windows DPAPI"],
    complexityFocus: "Offline peer discovery, local cryptography, and 20-table embedded persistence",
    summary:
      "Offline Windows LAN communication platform operating purely across local Wi-Fi and Ethernet subnets with hardware-protected device identities and zero cloud dependencies.",
    problem:
      "Air-gapped and strict enterprise LAN environments require encrypted messaging and file exchange without internet access, external identity providers, or central servers.",
    architectureSummary:
      "Combines UDP broadcast peer discovery on port 45820 with TLS 1.3 TCP messaging on port 45821, protecting device Ed25519/X25519 keys via Windows DPAPI and persisting messages across 20 normalized Drizzle SQLite tables.",
    highlights: [
      "Autonomous multi-adapter subnet discovery via UDP broadcast (45820) and direct TLS 1.3 TCP transport (45821).",
      "Permanent cryptographic device IDs (Ed25519, X25519, HKDF-SHA-256, AES-256-GCM, Argon2id) sealed in Windows DPAPI safeStorage.",
      "Sandboxed Electron renderer (contextIsolation, nodeIntegration: false, strict CSP) wired through Zod-validated typed IPC.",
      "High-concurrency local SQLite 3 storage in Write-Ahead Logging mode managed with Drizzle ORM across 20 schemas.",
      "Pluggable TransportAdapter abstraction decoupling LAN transport from UI stores and Vitest suites.",
    ],
    modules: [
      { path: "electron/services/", responsibility: "SystemInfoService, TrayManager, WindowManager, and single-instance lock" },
      { path: "electron/ipc/", responsibility: "Strongly typed IPC handlers with Zod wire envelope validation" },
      { path: "%APPDATA%/security/identity.dat", responsibility: "DPAPI-encrypted Ed25519 and X25519 device keypairs" },
      { path: "SQLite 3 (WAL)", responsibility: "20 normalized Drizzle ORM schemas with foreign-key integrity" },
    ],
    architectureFlow: [
      { id: "ui", label: "Sandboxed React UI", role: "Desktop Client", detail: "Context-isolated renderer with Zustand stores", layer: "person" },
      { id: "ipc", label: "Typed IPC Bridge", role: "Boundary", detail: "Zod wire envelope validation over preload", layer: "instrument" },
      { id: "crypto", label: "DPAPI + Ed25519", role: "Identity", detail: "Hardware-sealed device keys and AES-256-GCM", layer: "instrument" },
      { id: "lan", label: "UDP :45820 / TLS :45821", role: "LAN Mesh", detail: "Zero-cloud subnet discovery and SQLite WAL log", layer: "instrument" },
    ],
  },
  {
    slug: "brainflow",
    rank: 3,
    name: "BrainFlow",
    tagline: "Visual DAG AI workflow automation engine with async execution",
    category: "AI & Automation",
    tier: "ai",
    featured: true,
    repoUrl: "https://github.com/rpxexe/brainflow",
    liveUrl: "https://brainflow-zeta.vercel.app",
    year: "2026",
    runtime: "Next.js 16 + Inngest + Multi-LLM",
    stack: ["Next.js 16", "TypeScript", "tRPC", "Prisma", "PostgreSQL", "Inngest", "ReactFlow", "Vercel AI SDK", "Better Auth"],
    complexityFocus: "Topological graph execution, async job orchestration, and multi-LLM routing",
    summary:
      "Node-based workflow automation platform inspired by n8n.io, enabling teams to compose, topologically order, and asynchronously execute AI pipelines across OpenAI, Gemini, and Anthropic.",
    problem:
      "Chaining prompts, webhooks, and stateful side effects inside HTTP request handlers times out on long-running LLM steps and hides intermediate node failures.",
    architectureSummary:
      "Parses ReactFlow node graphs with toposort into deterministic execution stages, persists encrypted credentials via cryptr, and dispatches background runs through Inngest with real-time execution streaming back to tRPC clients.",
    highlights: [
      "Interactive canvas built with ReactFlow (@xyflow/react) and topological DAG sorting (toposort) to resolve dependency order.",
      "Event-driven background orchestration via Inngest and @inngest/realtime for durable asynchronous steps.",
      "Unified multi-provider LLM execution across OpenAI, Google Gemini, and Anthropic via Vercel AI SDK.",
      "End-to-end type-safe APIs with tRPC, SuperJSON, Zod, and Prisma on PostgreSQL.",
      "Session security via Better Auth, Polar billing hooks, encrypted secret storage, and Sentry observability.",
    ],
    modules: [
      { path: "ReactFlow Canvas", responsibility: "Visual node graph authoring, edge wiring, and node configuration" },
      { path: "Topological Executor", responsibility: "Validates acyclic dependencies via toposort before dispatch" },
      { path: "Inngest Engine", responsibility: "Durable background execution and realtime step telemetry" },
      { path: "tRPC + Prisma", responsibility: "Type-safe persistence for workflows, runs, and encrypted credentials" },
    ],
    architectureFlow: [
      { id: "canvas", label: "ReactFlow Editor", role: "Authoring", detail: "User wires trigger and LLM transformation nodes", layer: "person" },
      { id: "topo", label: "Toposort Planner", role: "Graph Check", detail: "Computes valid DAG execution order", layer: "instrument" },
      { id: "inngest", label: "Inngest Realtime", role: "Orchestrator", detail: "Runs durable background steps with retries", layer: "instrument" },
      { id: "llm", label: "Multi-LLM AI SDK", role: "Providers", detail: "Routes tasks to OpenAI, Gemini, and Anthropic", layer: "instrument" },
    ],
  },
  {
    slug: "assetsvista",
    rank: 4,
    name: "AssetsVista",
    tagline: "IT Asset Management with dry-run Excel imports and atomic offboarding",
    category: "Full-Stack SaaS",
    tier: "fullstack",
    featured: true,
    repoUrl: "https://github.com/rpxexe/AssetsVista",
    liveUrl: "https://assets-vista.vercel.app",
    screenshotPath: "/projects/assetsvista-home-desktop.png",
    screenshotAlt: "AssetsVista IT Asset Management interface",
    year: "2026",
    runtime: "Next.js 16 + MongoDB + Turbopack",
    stack: ["Next.js 16", "React 19", "TypeScript", "MongoDB", "Mongoose", "TanStack Query", "TanStack Table", "XLSX", "Resend"],
    complexityFocus: "Zero-write import dry runs, atomic employee offboarding, and PAT security",
    summary:
      "Modern full-stack IT Asset Management (ITAM) platform modeled on Snipe-IT operational workflows, engineered on Next.js 16 and MongoDB to eliminate bulk-import and offboarding bottlenecks.",
    problem:
      "Legacy ITAM suites rely on multi-step server reloads, partial spreadsheet imports that corrupt inventory mid-batch, and manual per-item cleanup during employee offboarding.",
    architectureSummary:
      "Pairs Mongoose asset/license/consumable schemas with a zero-write Excel dry-run validator, single-action atomic employee offboarding, custom session auth plus SHA-256 Personal Access Tokens, and TanStack Query SPA transitions.",
    highlights: [
      "Zero-write spreadsheet dry-run validation before committing native Excel (xlsx) bulk inventory imports.",
      "1-click atomic employee offboarding recovering assigned hardware, licenses, and accessories cleanly.",
      "Custom session authentication (/api/auth/*) paired with SHA-256 hashed Personal Access Tokens (/api/account/api-keys).",
      "QR code asset tagging, maintenance and EULA acceptance tracking, audit logs, Recharts analytics, and Resend email alerts.",
    ],
    modules: [
      { path: "app/api/bulk/route.ts", responsibility: "Excel parser with non-mutating dry-run validation pass" },
      { path: "app/api/auth/*", responsibility: "Custom registration, login, logout, and active session endpoints" },
      { path: "app/api/account/api-keys/route.ts", responsibility: "SHA-256 Personal Access Token generation and management" },
      { path: "app/api/core/asset/[id]/audit", responsibility: "Asset lifecycle auditing, assignment, and offboarding transitions" },
    ],
    architectureFlow: [
      { id: "admin", label: "IT Admin Console", role: "Operator", detail: "Uploads XLSX sheets or triggers offboarding", layer: "person" },
      { id: "dryrun", label: "Dry-Run Validator", role: "Safety Gate", detail: "Verifies rows without mutating MongoDB", layer: "instrument" },
      { id: "core", label: "Core ITAM APIs", role: "Business Logic", detail: "Atomic check-in/out, audits, and SHA-256 PATs", layer: "instrument" },
      { id: "mongo", label: "MongoDB + Resend", role: "Persistence", detail: "Stores asset ledger and dispatches email alerts", layer: "instrument" },
    ],
  },
  {
    slug: "hateable",
    rank: 5,
    name: "Hateable",
    tagline: "AI code-generation workspace inside isolated E2B sandboxes",
    category: "AI & Automation",
    tier: "ai",
    featured: true,
    repoUrl: "https://github.com/rpxexe/hateable",
    liveUrl: "https://hateable-self.vercel.app",
    screenshotPath: "/projects/hateable-home-desktop.png",
    screenshotAlt: "Hateable AI app generation workspace",
    year: "2026",
    runtime: "Next.js + E2B + Inngest AgentKit",
    stack: ["Next.js", "TypeScript", "E2B Code Interpreter", "Inngest AgentKit", "tRPC", "Prisma", "PostgreSQL", "Clerk"],
    complexityFocus: "Autonomous agent tool-use inside disposable cloud sandboxes",
    summary:
      "Full-stack AI application builder pairing Inngest AgentKit orchestration with disposable E2B Code Interpreter sandboxes, interactive file tree inspection, and live project previews.",
    problem:
      "Running LLM-generated application code directly on an application server creates severe security risks and blocks request threads during dependency installation and builds.",
    architectureSummary:
      "Dispatches user prompts through rate-limited tRPC procedures into Inngest AgentKit workers that write, install, and execute code inside isolated E2B sandboxes while persisting generated file trees to PostgreSQL.",
    highlights: [
      "Sandboxed code synthesis and runtime execution via @e2b/code-interpreter.",
      "Multi-step agent execution loop powered by @inngest/agent-kit with async background persistence.",
      "Interactive file explorer (tree-view) and syntax-highlighted code viewer per generated project.",
      "Clerk authentication, rate-limiter-flexible request guards, and Prisma + PostgreSQL persistence.",
    ],
    modules: [
      { path: "src/app/api/inngest/route.ts", responsibility: "AgentKit execution handler orchestrating E2B sandbox tools" },
      { path: "src/app/projects/[projectId]/page.tsx", responsibility: "Split project workspace with generated file explorer and preview" },
      { path: "src/components/file-explorer.tsx", responsibility: "Hierarchical source tree and code inspection pane" },
      { path: "src/app/api/trpc/[trpc]/route.ts", responsibility: "Type-safe project creation, history, and message queries" },
    ],
    architectureFlow: [
      { id: "prompt", label: "Project Prompt", role: "Builder", detail: "Submits app specification in /projects workspace", layer: "person" },
      { id: "agent", label: "Inngest AgentKit", role: "Agent Loop", detail: "Plans file edits and terminal commands", layer: "instrument" },
      { id: "e2b", label: "E2B Sandbox", role: "Isolated VM", detail: "Executes generated code safely off host", layer: "instrument" },
      { id: "tree", label: "Prisma + File Tree", role: "Snapshot", detail: "Persists generated files and live preview URL", layer: "instrument" },
    ],
  },
  {
    slug: "kalaconnect",
    rank: 6,
    name: "KalaConnect",
    tagline: "Android and backend marketplace bridging rural artisans with buyers",
    category: "Mobile & Web",
    tier: "web",
    featured: false,
    repoUrl: "https://github.com/rpxexe/kalaconnect",
    year: "2026",
    runtime: "Java Android + PostgreSQL + Gemini",
    stack: ["Java (Android)", "REST Backend", "Aiven PostgreSQL", "Google Gemini API"],
    complexityFocus: "Three-sided SHG, NGO, and buyer workflows with AI cataloging",
    summary:
      "Digital commerce and cataloging platform connecting rural Self-Help Groups (SHGs) and artisans, NGO administrators, and urban or global buyers.",
    problem:
      "Rural artisans lack accessible digital storefronts and structured product cataloging workflows needed to reach external buyers through verified NGO channels.",
    architectureSummary:
      "Connects a Java Android client to a PostgreSQL-backed REST server with Gemini-assisted cultural cataloging, role-separated NGO verification, and direct customer enquiries.",
    highlights: [
      "Three-actor architecture covering Artisans/SHGs, NGO administrators, and Customers.",
      "Gemini AI integration assisting with cultural product descriptions and catalog promotion.",
      "Aiven PostgreSQL database migration setup and authenticated profile publishing.",
    ],
    modules: [
      { path: "Android Client (Java)", responsibility: "Artisan onboarding, catalog creation, and buyer discovery" },
      { path: "Backend + PostgreSQL", responsibility: "Product moderation, NGO approvals, and enquiry persistence" },
      { path: "Gemini Integration", responsibility: "AI-assisted product storytelling and cultural tagging" },
    ],
    architectureFlow: [
      { id: "artisan", label: "Artisan / SHG", role: "Creator", detail: "Captures handcrafted item via Android app", layer: "person" },
      { id: "gemini", label: "Gemini Cataloging", role: "AI Assist", detail: "Enriches cultural metadata and listings", layer: "instrument" },
      { id: "ngo", label: "NGO Review API", role: "Verification", detail: "Authenticates artisan profiles on Aiven PG", layer: "instrument" },
      { id: "buyer", label: "Marketplace Feed", role: "Discovery", detail: "Delivers verified listings and direct enquiries", layer: "instrument" },
    ],
  },
  {
    slug: "avodah-group",
    rank: 7,
    name: "Avodah Group",
    tagline: "Multi-vertical corporate platform with Three.js architectural canvas",
    category: "Mobile & Web",
    tier: "web",
    featured: false,
    repoUrl: "https://github.com/rpxexe/avodah-group",
    liveUrl: "https://avodah-group.vercel.app",
    screenshotPath: "/projects/avodah-home-desktop.png",
    screenshotAlt: "Avodah Group web application homepage",
    year: "2026",
    runtime: "Next.js + Three.js + PostgreSQL",
    stack: ["Next.js", "React", "TypeScript", "Three.js", "Framer Motion", "Prisma", "PostgreSQL"],
    complexityFocus: "Custom WebGL canvas sequencing paired with multi-route lead APIs",
    summary:
      "Multi-vertical web platform spanning FinTech, PropTech, AI voice, and advisory routes with Three.js architectural canvas sequences and PostgreSQL-backed APIs.",
    problem:
      "Presenting multi-division business verticals without generic static templates while supporting lead capture, waitlist, newsletter, and careers workflows.",
    architectureSummary:
      "Pairs a custom ArchitecturalCanvasSequence Three.js component and Framer Motion route transitions with Prisma + PostgreSQL API endpoints across /api/contact, /api/careers, /api/newsletter, and /api/waitlist.",
    highlights: [
      "Custom Three.js architectural canvas sequence and interactive 3D card components.",
      "Dedicated domain routes for FinTech, PropTech, AI Voice Bot, Mandate, Research, and Leasing Advisory.",
      "PostgreSQL persistence via Prisma across contact, careers, newsletter, and waitlist endpoints.",
    ],
    modules: [
      { path: "src/components/ArchitecturalCanvasSequence.tsx", responsibility: "Three.js spatial visual sequence on primary landing" },
      { path: "src/app/api/*", responsibility: "Contact, careers, waitlist, newsletter, and health routes" },
      { path: "src/app/{fintech,proptech,ai-voice-bot}", responsibility: "Dedicated vertical showcase pages" },
    ],
    architectureFlow: [
      { id: "visitor", label: "Vertical Navigation", role: "Visitor", detail: "Explores FinTech, PropTech, and Advisory pages", layer: "person" },
      { id: "webgl", label: "Three.js Canvas", role: "Rendering", detail: "Runs ArchitecturalCanvasSequence and tilt", layer: "instrument" },
      { id: "api", label: "Next.js API + Prisma", role: "Persistence", detail: "Stores contact, waitlist, and career entries in PG", layer: "instrument" },
    ],
  },
  {
    slug: "taskpulse",
    rank: 8,
    name: "TaskPulse",
    tagline: "Type-safe task management platform on Neon Postgres and Better Auth",
    category: "Full-Stack SaaS",
    tier: "fullstack",
    featured: false,
    repoUrl: "https://github.com/rpxexe/Task-Management-Tool",
    year: "2026",
    runtime: "Next.js 16 + Neon Postgres + Prisma 7",
    stack: ["Next.js 16", "React 19", "TypeScript", "Neon PostgreSQL", "Prisma 7", "Better Auth", "Zod", "Tailwind v4"],
    complexityFocus: "Prisma 7 serverless adapter pooling and schema-validated CRUD",
    summary:
      "Full-stack task workspace engineered with Next.js 16, React 19, Prisma ORM 7 on serverless Neon PostgreSQL, and salted session auth via Better Auth.",
    problem:
      "Demonstrates clean serverless PostgreSQL connection pooling, strict TypeScript validation, and responsive CRUD flows under modern React 19 patterns.",
    architectureSummary:
      "Uses Prisma 7 native PostgreSQL adapters (@prisma/adapter-neon / @prisma/adapter-pg) with Zod + React Hook Form validation and Better Auth session guards.",
    highlights: [
      "Full task CRUD, live status analytics, and adaptive desktop/mobile navigation.",
      "Prisma 7 adapter integration with serverless Neon PostgreSQL pooling.",
      "Session-based authentication with Better Auth and Zod schema validation.",
    ],
    modules: [
      { path: "Prisma 7 + Neon Adapter", responsibility: "Serverless PostgreSQL modeling and pooled queries" },
      { path: "Better Auth Layer", responsibility: "Salted password hashing and protected session routes" },
      { path: "Zod + React Hook Form", responsibility: "Shared client/server payload validation" },
    ],
    architectureFlow: [
      { id: "user", label: "Task Dashboard", role: "User", detail: "Creates, filters, and updates tasks", layer: "person" },
      { id: "auth", label: "Better Auth + Zod", role: "Validation", detail: "Verifies session and input schemas", layer: "instrument" },
      { id: "neon", label: "Prisma 7 + Neon PG", role: "Database", detail: "Executes pooled queries on serverless Postgres", layer: "instrument" },
    ],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
