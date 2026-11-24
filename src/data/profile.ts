export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  location: string;
  highlights: string[];
  stack: string[];
}

export interface SkillGroup {
  id: string;
  domain: string;
  summary: string;
  items: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  score: string;
}

export const PROFILE = {
  name: "Rishabh Vishwakarma",
  handle: "rpxexe",
  role: "Full-Stack & Systems Engineer",
  headline: "Full-stack systems, Win32 to AI DAGs",
  subhead:
    "I'm Rishabh, a full-stack & systems engineer in Mumbai. I take products from native Windows internals to multi-LLM pipelines, and ship them production-ready.",
  availability: "Open to full-time software engineering roles and select freelance systems work.",
  location: "Mumbai, Maharashtra, India",
  email: "111rishwakarma@gmail.com",
  github: "https://github.com/rpxexe",
  linkedin: "https://www.linkedin.com/in/rpxexe",
  legacyPortfolio: "https://rpxexe.github.io/Rishabh",
  sourceRepo: "https://github.com/rpxexe/portfolio",
  resumePdfPath: "/resume.pdf",
  /**
   * About-section portrait. Swap in your own media:
   *  - photo: drop e.g. `portrait.jpg` (4:5 crop, at least 900x1125) into public/me/
   *           then set { kind: "image", src: "/me/portrait.jpg" }
   *  - video: drop a short muted loop `intro.mp4` (4:5, under ~4 MB) plus a poster frame
   *           then set { kind: "video", src: "/me/intro.mp4", poster: "/me/portrait.jpg" }
   */
  portrait: {
    kind: "image" as "image" | "video",
    src: "/me/portrait.jpg",
    poster: undefined as string | undefined,
    alt: "Portrait of Rishabh Vishwakarma",
  },
  summary:
    "B.Sc. IT graduate (CGPI 8.70/10) with 1.5 years of production web engineering experience across TypeScript, React, Next.js, Node.js, relational and document databases, LLM orchestration, and cross-layer desktop systems.",
  experience: [
    {
      id: "last-search",
      role: "Web Developer",
      organization: "Last Search",
      period: "Dec 2023 to May 2025",
      location: "Mumbai, India",
      highlights: [
        "Engineered responsive full-stack web applications with TypeScript, React, Next.js, and Node.js.",
        "Built REST APIs, authentication flows, relational and document schemas across PostgreSQL, MongoDB, MySQL, Prisma, and Mongoose.",
        "Integrated LLM-driven product features using OpenAI, Google Gemini, and Anthropic APIs.",
        "Customized WordPress themes and plugins while improving page performance, responsiveness, and search visibility.",
      ],
      stack: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "MongoDB", "Prisma", "OpenAI / Gemini / Anthropic"],
    },
  ] satisfies ExperienceItem[],
  education: [
    {
      degree: "Bachelor of Science in Information Technology",
      institution: "Smt. K.G. Mittal Institute of Management, Information Technology and Research",
      period: "Jun 2022 to Jun 2025",
      score: "CGPI 8.70 / 10",
    },
  ] satisfies EducationItem[],
  achievements: [
    "Secured 1st Position in College Coding Competition (C++, data structures, algorithms, and problem-solving).",
  ],
  certifications: [
    {
      title: "Advanced TypeScript Course",
      issuer: "Udemy",
      detail: "Generics, utility types, and conditional type inference.",
    },
    {
      title: "Advanced React Course",
      issuer: "Udemy",
      detail: "Hooks architecture, state management, and render performance.",
    },
    {
      title: "Bridge Course Certificates",
      issuer: "Academic Track",
      detail: "JavaScript, Flutter, Kotlin, and Django foundations.",
    },
  ],
  skills: [
    {
      id: "systems",
      domain: "Systems & Desktop",
      summary: "Low-level IPC, real-time media transport, and offline local-first protocols.",
      items: ["Electron 34", "WebRTC (DTLS-SRTP)", "WebSocket", "C# Win32 SendInput", "UDP / TLS 1.3", "SQLite WAL", "Windows DPAPI"],
    },
    {
      id: "ai",
      domain: "AI & Workflow Orchestration",
      summary: "Deterministic DAG pipelines, event-driven agents, and isolated code sandboxes.",
      items: ["Vercel AI SDK", "OpenAI API", "Google Gemini API", "Anthropic API", "Inngest", "AgentKit", "E2B Code Interpreter", "ReactFlow"],
    },
    {
      id: "fullstack",
      domain: "Full-Stack & Data",
      summary: "End-to-end type-safe APIs, schema design, and transactional operations.",
      items: ["TypeScript", "Next.js 16", "React 19", "Node.js", "Express", "tRPC", "PostgreSQL", "MongoDB", "MySQL", "Prisma", "Drizzle ORM", "Mongoose"],
    },
    {
      id: "frontend",
      domain: "Frontend & UI",
      summary: "Accessible component systems, state synchronization, and responsive layout architecture.",
      items: ["Tailwind CSS", "shadcn/ui", "TanStack Query", "TanStack Table", "Redux / Saga", "GSAP", "Lenis", "Vite"],
    },
    {
      id: "quality",
      domain: "QA & Verification",
      summary: "Structured validation across API contracts, database integrity, and production regressions.",
      items: ["API Testing (Postman)", "SQL Database Validation", "Functional & Regression Testing", "Smoke & Sanity", "UAT", "Cross-Browser QA", "Git / GitHub"],
    },
  ] satisfies SkillGroup[],
  languages: ["English", "Hindi", "Marathi"],
};
