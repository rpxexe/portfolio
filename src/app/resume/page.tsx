import type { Metadata } from "next";
import Link from "next/link";
import { ResumeActions } from "@/components/ResumeActions";
import { PROFILE } from "@/data/profile";
import { FEATURED_PROJECTS } from "@/data/projects";

export const metadata: Metadata = {
  title: `Resume: ${PROFILE.name}`,
  description:
    "Resume of Rishabh Vishwakarma: Web Developer experience, TypeScript, Next.js, AI orchestration, and systems projects.",
};

export default function ResumePage() {
  const resumeProjects = FEATURED_PROJECTS.slice(0, 4);

  return (
    <section className="band-section--tight" aria-labelledby="resume-heading">
      <div className="container max-w-4xl flex flex-col gap-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-rule">
          <div className="flex flex-col gap-2">
            <h1 id="resume-heading" style={{ fontSize: "var(--text-display-s)" }}>
              {PROFILE.name}
            </h1>
            <p className="lead text-ink-2">{PROFILE.role}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted pt-1">
              <span>{PROFILE.location}</span>
              <a href={`mailto:${PROFILE.email}`} className="text-link">
                {PROFILE.email}
              </a>
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="text-link">
                github.com/rpxexe
              </a>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                linkedin.com/in/rpxexe
              </a>
            </div>
          </div>

          <ResumeActions />
        </header>

        <section className="grid gap-3" aria-labelledby="res-summary">
          <h2 id="res-summary" style={{ fontSize: "var(--text-xl)" }}>
            Summary
          </h2>
          <p className="text-ink-2">{PROFILE.summary}</p>
        </section>

        <section className="grid gap-6" aria-labelledby="res-exp">
          <h2 id="res-exp" style={{ fontSize: "var(--text-xl)" }}>
            Experience
          </h2>
          {PROFILE.experience.map((exp) => (
            <article key={exp.id} className="panel p-6 grid gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-medium text-ink">
                  {exp.role}, {exp.organization}
                </h3>
                <span className="measured text-cool">{exp.period}</span>
              </div>
              <p className="text-sm text-muted">{exp.location}</p>
              <ul className="grid gap-2 text-sm text-ink-2 list-disc pl-5">
                {exp.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-6" aria-labelledby="res-proj">
          <h2 id="res-proj" style={{ fontSize: "var(--text-xl)" }}>
            Selected Engineering Projects
          </h2>
          <div className="grid gap-4">
            {resumeProjects.map((proj) => (
              <article key={proj.slug} className="panel p-6 grid gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-medium text-ink">
                    <Link href={`/work/${proj.slug}`} className="hover:text-accent">
                      {proj.name}
                    </Link>
                  </h3>
                  <span className="measured text-cool">{proj.runtime}</span>
                </div>
                <p className="text-sm text-ink-2">{proj.summary}</p>
                <ul className="grid gap-1.5 text-sm text-muted list-disc pl-5">
                  {proj.highlights.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4" aria-labelledby="res-skills">
          <h2 id="res-skills" style={{ fontSize: "var(--text-xl)" }}>
            Technical Skills
          </h2>
          <dl className="panel p-6 grid gap-3 text-sm">
            {PROFILE.skills.map((group) => (
              <div key={group.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pb-3 border-b border-rule last:border-0 last:pb-0">
                <dt className="sm:col-span-4 font-medium text-ink">{group.domain}</dt>
                <dd className="sm:col-span-8 text-ink-2">{group.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-labelledby="res-edu">
          <div className="panel p-6 grid gap-3">
            <h2 id="res-edu" style={{ fontSize: "var(--text-xl)" }}>
              Education
            </h2>
            {PROFILE.education.map((edu) => (
              <div key={edu.degree} className="grid gap-1 text-sm">
                <p className="font-medium text-ink">{edu.degree}</p>
                <p className="text-ink-2">{edu.institution}</p>
                <p className="measured text-cool">{edu.period}</p>
                <p className="measured text-accent">{edu.score}</p>
              </div>
            ))}
          </div>

          <div className="panel p-6 grid gap-3">
            <h2 style={{ fontSize: "var(--text-xl)" }}>Achievements & Certifications</h2>
            <p className="text-sm text-ink-2">{PROFILE.achievements[0]}</p>
            <ul className="grid gap-1.5 text-sm text-muted list-disc pl-5">
              {PROFILE.certifications.map((cert) => (
                <li key={cert.title}>
                  <span className="text-ink">{cert.title}</span> ({cert.issuer})
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted pt-2 border-t border-rule">
              Languages: {PROFILE.languages.join(", ")}
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}

