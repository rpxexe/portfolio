import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Code2, Link2, Mail, MapPin } from "lucide-react";
import { ResumeActions } from "@/components/ResumeActions";
import { ResumeShell, type TocItem } from "@/components/ResumeMotion";
import { SectionHeading } from "@/components/SectionHeading";
import { PROFILE } from "@/data/profile";
import { FEATURED_PROJECTS } from "@/data/projects";

export const metadata: Metadata = {
  title: `Resume: ${PROFILE.name}`,
  description:
    "Resume of Rishabh Vishwakarma: Web Developer experience, TypeScript, Next.js, AI orchestration, and systems projects.",
};

const TOC: TocItem[] = [
  { id: "cv-summary", label: "Summary" },
  { id: "cv-experience", label: "Experience" },
  { id: "cv-projects", label: "Projects" },
  { id: "cv-skills", label: "Skills" },
  { id: "cv-education", label: "Education" },
];

export default function ResumePage() {
  const resumeProjects = FEATURED_PROJECTS.slice(0, 4);

  return (
    <section className="resume band-section--tight" data-src="src/app/resume/page.tsx" aria-labelledby="resume-heading">
      <div className="container">
        <header className="resume__hero">
          <div className="resume__hero-main">
            <SectionHeading as="h1" index="CV" kicker="resume.pdf" title="Rishabh *Vishwakarma*" id="resume-heading" />
            <p data-reveal className="lead text-ink-2">
              {PROFILE.role}. {PROFILE.availability}
            </p>
            <ul data-reveal className="resume__contacts">
              <li>
                <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
                {PROFILE.location}
              </li>
              <li>
                <Mail size={14} strokeWidth={1.75} aria-hidden="true" />
                <a href={`mailto:${PROFILE.email}`} className="text-link">{PROFILE.email}</a>
              </li>
              <li>
                <Code2 size={14} strokeWidth={1.75} aria-hidden="true" />
                <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="text-link">github.com/rpxexe</a>
              </li>
              <li>
                <Link2 size={14} strokeWidth={1.75} aria-hidden="true" />
                <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">linkedin.com/in/rpxexe</a>
              </li>
            </ul>
          </div>
          <div data-reveal>
            <ResumeActions />
          </div>
        </header>

        <ResumeShell toc={TOC}>
          <section id="cv-summary" className="cv-section" aria-labelledby="cv-summary-h">
            <h2 id="cv-summary-h" className="cv-h">
              <span className="cv-h__num">01</span> Summary
            </h2>
            <p data-reveal className="cv-summary">{PROFILE.summary}</p>
          </section>

          <section id="cv-experience" className="cv-section" aria-labelledby="cv-exp-h">
            <h2 id="cv-exp-h" className="cv-h">
              <span className="cv-h__num">02</span> Experience
            </h2>
            <ol className="cv-timeline">
              <span className="cv-timeline__track" aria-hidden="true">
                <span className="cv-timeline__fill" />
              </span>
              {PROFILE.experience.map((exp) => (
                <li key={exp.id} className="cv-timeline__item">
                  <span className="cv-timeline__node" aria-hidden="true" />
                  <div className="cv-timeline__head">
                    <h3 className="cv-timeline__role">
                      {exp.role} <span className="text-muted">at</span> <span className="text-accent">{exp.organization}</span>
                    </h3>
                    <span className="measured text-cool">{exp.period}</span>
                  </div>
                  <p className="measured text-muted">{exp.location}</p>
                  <ul className="cv-timeline__points">
                    {exp.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <ul className="cv-chips">
                    {exp.stack.map((s) => (
                      <li key={s} className="chip">{s}</li>
                    ))}
                  </ul>
                </li>
              ))}
              {PROFILE.education.map((edu) => (
                <li key={edu.degree} className="cv-timeline__item">
                  <span className="cv-timeline__node" aria-hidden="true" />
                  <div className="cv-timeline__head">
                    <h3 className="cv-timeline__role">
                      B.Sc. Information Technology <span className="text-muted">at</span>{" "}
                      <span className="text-accent">K.G. Mittal Institute</span>
                    </h3>
                    <span className="measured text-cool">{edu.period}</span>
                  </div>
                  <p className="measured text-muted">{edu.score}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="cv-projects" className="cv-section" aria-labelledby="cv-proj-h">
            <h2 id="cv-proj-h" className="cv-h">
              <span className="cv-h__num">03</span> Selected projects
            </h2>
            <div className="cv-projects">
              {resumeProjects.map((proj) => (
                <article key={proj.slug} data-reveal className="cv-project">
                  <div className="cv-project__top">
                    <span className="cv-project__rank measured">0{proj.rank}</span>
                    <span className="measured text-muted">{proj.runtime}</span>
                  </div>
                  <h3 className="cv-project__name">
                    <Link href={`/work/${proj.slug}`} className="cv-project__link">
                      {proj.name}
                      <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </h3>
                  <p className="text-sm text-ink-2">{proj.summary}</p>
                  <ul className="cv-project__points">
                    {proj.highlights.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="cv-skills" className="cv-section" aria-labelledby="cv-skills-h">
            <h2 id="cv-skills-h" className="cv-h">
              <span className="cv-h__num">04</span> Technical skills
            </h2>
            <div className="cv-skills">
              {PROFILE.skills.map((group) => (
                <div key={group.id} className="cv-skill">
                  <div>
                    <h3 className="cv-skill__domain">{group.domain}</h3>
                    <p className="text-sm text-muted">{group.summary}</p>
                  </div>
                  <ul className="cv-chips">
                    {group.items.map((item) => (
                      <li key={item} className="chip">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="cv-education" className="cv-section" aria-labelledby="cv-edu-h">
            <h2 id="cv-edu-h" className="cv-h">
              <span className="cv-h__num">05</span> Education &amp; recognition
            </h2>
            <div className="cv-cards">
              {PROFILE.education.map((edu) => (
                <article key={edu.degree} data-reveal className="cv-card">
                  <p className="measured text-accent">{edu.score}</p>
                  <h3 className="cv-card__title">{edu.degree}</h3>
                  <p className="text-sm text-ink-2">{edu.institution}</p>
                  <p className="measured text-cool">{edu.period}</p>
                </article>
              ))}
              <article data-reveal className="cv-card">
                <p className="measured text-accent">#1</p>
                <h3 className="cv-card__title">Achievements</h3>
                <p className="text-sm text-ink-2">{PROFILE.achievements[0]}</p>
              </article>
              <article data-reveal className="cv-card cv-card--wide">
                <p className="measured text-accent">certifications</p>
                <ul className="cv-certs">
                  {PROFILE.certifications.map((cert) => (
                    <li key={cert.title}>
                      <span className="text-ink">{cert.title}</span>
                      <span className="measured text-muted"> · {cert.issuer}</span>
                      <p className="text-sm text-ink-2">{cert.detail}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted cv-langs">Languages: {PROFILE.languages.join(", ")}</p>
              </article>
            </div>
          </section>
        </ResumeShell>
      </div>
    </section>
  );
}
