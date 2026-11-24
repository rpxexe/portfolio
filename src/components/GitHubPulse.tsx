import { PROFILE } from "@/data/profile";

// Server component. Two GitHub calls per hour (cached), well under the 60/hour unauthenticated limit.
const REVALIDATE = 3600;
const USER = PROFILE.handle;

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
}
interface Commit {
  html_url: string;
  commit: { message: string; author: { date: string } | null };
}

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate: REVALIDATE },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Coarse on purpose: the page is cached for up to an hour, so minutes would lie. */
function ago(iso: string) {
  const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (hours < 2) return "within the last hour or two";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export async function GitHubPulse() {
  const repos = (await gh<Repo[]>(`/users/${USER}/repos?sort=pushed&per_page=6`))?.filter((r) => !r.fork && r.name !== USER) // skip forks and the profile-README repo
    .slice(0, 3);
  if (!repos?.length) return null; // API down or rate-limited: the section simply disappears

  const latest = repos[0];
  const commit = (await gh<Commit[]>(`/repos/${USER}/${latest.name}/commits?per_page=1`))?.[0];
  const subject = commit?.commit.message.split("\n")[0];

  return (
    <div data-src="src/components/GitHubPulse.tsx" className="flex flex-col gap-4 border-t border-rule pt-8">
      <div data-reveal className="flex items-center gap-2">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-accent" />
        </span>
        <span className="measured text-accent">live from github.com/{USER}</span>
      </div>

      <p data-reveal className="text-lg text-ink">
        Last pushed to{" "}
        <a href={latest.html_url} target="_blank" rel="noopener noreferrer" className="text-link">
          {latest.name}
        </a>{" "}
        <span className="text-muted">{ago(latest.pushed_at)}</span>
        {subject && commit && (
          <>
            :{" "}
            <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="measured text-sm text-ink-2 hover:text-accent">
              &ldquo;{subject.length > 90 ? `${subject.slice(0, 89)}…` : subject}&rdquo;
            </a>
          </>
        )}
      </p>

      <ul data-reveal-stagger className="grid gap-3 sm:grid-cols-3">
        {repos.map((r) => (
          <li key={r.name} className="pulse-card flex flex-col gap-1 border border-rule rounded-[var(--radius-card)] p-4">
            <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-ink hover:text-accent">
              {r.name}
            </a>
            {r.description && <p className="text-xs text-ink-2 line-clamp-2">{r.description}</p>}
            <span className="measured text-xs text-muted mt-auto pt-1">
              {[r.language, ago(r.pushed_at)].filter(Boolean).join(" · ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
