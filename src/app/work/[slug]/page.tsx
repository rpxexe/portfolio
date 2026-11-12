import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";
import { CaseStudyMotion, CaseStudyWalkthrough } from "@/components/CaseStudyMotion";
import { Magnetic } from "@/components/Magnetic";
import { WobbleCard } from "@/components/WobbleCard";
import { PROJECTS } from "@/data/projects";
import { PROFILE } from "@/data/profile";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return { title: `Project not found: ${PROFILE.name}` };
  return {
    title: `${project.name} Case Study: ${PROFILE.name}`,
    description: project.tagline,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();

  const project = PROJECTS[idx];
  const prev = idx > 0 ? PROJECTS[idx - 1] : null;
  const next = idx < PROJECTS.length - 1 ? PROJECTS[idx + 1] : null;

  return (
    <CaseStudyMotion>
      <article className="band-section--tight" aria-labelledby="case-heading">
        <div className="container flex flex-col gap-14">
          <div className="flex flex-col gap-6">
            <Link href="/work" data-case-hero className="inline-flex items-center gap-2 text-sm text-link w-fit">
              <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>Back to all work</span>
            </Link>

            <div data-case-hero className="flex flex-wrap items-center gap-3">
              <span className="measured text-cool">rank 0{project.rank}</span>
              <span className="chip chip--instrument">{project.category}</span>
              <span className="measured text-muted">{project.runtime}</span>
            </div>

            <h1 id="case-heading" data-case-hero>
              {project.name}
            </h1>

            <p data-case-hero className="lead text-ink-2">
              {project.summary}
            </p>

            <div data-case-hero className="flex flex-wrap items-center gap-4">
              <Magnetic>
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  <Code2 size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span>View source</span>
                </a>
              </Magnetic>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                >
                  <span>Open live app</span>
                  <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {project.screenshotPath && (
            <div data-case-parallax>
              <WobbleCard tilt={4.5} wobble={1} className="rounded-xl">
                <figure data-case-hero className="capture-frame">
                  <Image
                    src={project.screenshotPath}
                    alt={project.screenshotAlt ?? `${project.name} interface`}
                    width={1440}
                    height={900}
                    priority
                    className="capture-frame__media"
                  />
                </figure>
              </WobbleCard>
            </div>
          )}

          <section className="flex flex-col gap-6" aria-labelledby="arch-flow-heading">
            <h2 id="arch-flow-heading" style={{ fontSize: "var(--text-2xl)" }}>
              Architecture signal walkthrough
            </h2>
            <CaseStudyWalkthrough
              nodes={project.architectureFlow}
              highlights={project.highlights}
              modules={project.modules}
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10" aria-labelledby="engineering-heading">
            <div className="lg:col-span-6 flex flex-col gap-6">
              <h2 id="engineering-heading" style={{ fontSize: "var(--text-2xl)" }}>
                Problem and design
              </h2>
              <WobbleCard tilt={5} wobble={1.1} className="rounded-xl">
                <div className="panel p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-ink">Constraint</h3>
                    <p className="text-sm text-ink-2 mt-2">{project.problem}</p>
                  </div>
                  <div className="pt-4 border-t border-rule">
                    <h3 className="text-lg font-medium text-ink">System solution</h3>
                    <p className="text-sm text-ink-2 mt-2">{project.architectureSummary}</p>
                  </div>
                </div>
              </WobbleCard>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-6">
              <h2 style={{ fontSize: "var(--text-2xl)" }}>Verified engineering details</h2>
              <WobbleCard tilt={5} wobble={1.1} className="rounded-xl">
                <ul className="panel p-6 grid gap-3 text-sm text-ink-2">
                  {project.highlights.map((item) => (
                    <li key={item} data-case-row className="pb-3 border-b border-rule last:border-0 last:pb-0">
                      {item}
                    </li>
                  ))}
                </ul>
              </WobbleCard>
            </div>
          </section>

          <section className="flex flex-col gap-6" aria-labelledby="modules-heading">
            <h2 id="modules-heading" style={{ fontSize: "var(--text-2xl)" }}>
              Repository modules
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-rule text-sm text-muted">
                    <th className="py-3 pr-6 font-medium">Module path</th>
                    <th className="py-3 font-medium">Responsibility</th>
                  </tr>
                </thead>
                <tbody>
                  {project.modules.map((mod) => (
                    <tr key={mod.path} data-case-row className="border-b border-rule align-top">
                      <td className="py-4 pr-6 measured text-cool whitespace-nowrap">{mod.path}</td>
                      <td className="py-4 text-sm text-ink-2">{mod.responsibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {project.stack.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <nav
            aria-label="Adjacent project case studies"
            className="pt-8 border-t border-rule flex flex-col sm:flex-row justify-between gap-4 text-sm"
          >
            {prev ? (
              <Link href={`/work/${prev.slug}`} className="text-link">
                Previous: 0{prev.rank} {prev.name}
              </Link>
            ) : (
              <span className="text-muted">Highest complexity tier</span>
            )}
            {next ? (
              <Link href={`/work/${next.slug}`} className="text-link font-medium">
                Next: 0{next.rank} {next.name}
              </Link>
            ) : (
              <Link href="/work" className="text-link font-medium">
                Back to index
              </Link>
            )}
          </nav>
        </div>
      </article>
    </CaseStudyMotion>
  );
}
