import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { GitHubPulse } from "@/components/GitHubPulse";

// Re-render at most hourly so the GitHub activity stays fresh
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeSections pulse={<GitHubPulse />} />
    </>
  );
}
