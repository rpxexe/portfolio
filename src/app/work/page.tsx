import type { Metadata } from "next";
import { WorkCatalog } from "@/components/WorkCatalog";
import { PROFILE } from "@/data/profile";

export const metadata: Metadata = {
  title: `Work: ${PROFILE.name}`,
  description:
    "Projects by Rishabh Vishwakarma ranked by architectural complexity, from Electron/Win32 systems to AI workflow orchestration.",
};

export default function WorkPage() {
  return (
    <section className="band-section--tight" aria-labelledby="work-page-heading">
      <div className="container flex flex-col gap-10">
        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 id="work-page-heading">Systems and production work</h1>
          <p className="lead text-ink-2">
            Ranked from native Windows protocols to multi-LLM orchestration and SaaS platforms.
          </p>
        </div>

        <WorkCatalog />
      </div>
    </section>
  );
}
