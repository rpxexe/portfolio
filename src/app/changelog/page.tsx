import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { TimeMachine, type HistoryCommit } from "@/components/TimeMachine";
import { PROFILE } from "@/data/profile";
import history from "@/data/history.json";

export const metadata: Metadata = {
  title: `Changelog: ${PROFILE.name}`,
  description: "Every version of this portfolio, from its git history: what changed, when, and how much.",
};

export default function ChangelogPage() {
  return (
    <section className="band-section--tight" aria-labelledby="changelog-heading">
      <div className="container flex flex-col gap-10">
        <div className="flex flex-col gap-4 max-w-3xl">
          <SectionHeading as="h1" index="C" kicker="git/log" title="This site, *version by version*" id="changelog-heading" />
          <p data-reveal className="lead text-ink-2">
            Scrub through the commits that built this portfolio. The numbers come straight from git at build time.
          </p>
        </div>

        <TimeMachine commits={history as HistoryCommit[]} />
      </div>
    </section>
  );
}
