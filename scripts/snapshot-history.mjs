// Snapshots this repo's git history into src/data/history.json for the /changelog time machine.
// Runs before every build. CI clones are often shallow, so it never replaces a longer snapshot with a shorter one.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const OUT = "src/data/history.json";
// Generated or vendored files would drown out the real changes
const NOISE = /(^|\/)(bun\.lock|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|history\.json)$/;

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];

let log = "";
try {
  log = execFileSync("git", ["log", "--no-merges", "--reverse", "--numstat", "--pretty=format:@@%H%x09%aI%x09%s"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (err) {
  console.warn(`[history] git log failed, keeping ${previous.length} snapshot commits: ${err.message}`);
  process.exit(0);
}

const commits = [];
for (const block of log.split("@@").filter(Boolean)) {
  const [header, ...lines] = block.trim().split("\n");
  const [hash, date, ...subject] = header.split("\t");
  const files = lines
    .map((l) => l.split("\t"))
    .filter((p) => p.length === 3 && !NOISE.test(p[2]))
    // Binary files report "-" for both counts
    .map(([a, d, path]) => ({ path, add: Number(a) || 0, del: Number(d) || 0 }));
  commits.push({
    hash,
    date,
    subject: subject.join("\t"),
    additions: files.reduce((s, f) => s + f.add, 0),
    deletions: files.reduce((s, f) => s + f.del, 0),
    filesChanged: files.length,
    files: files.sort((a, b) => b.add + b.del - (a.add + a.del)).slice(0, 8),
  });
}

if (commits.length < previous.length) {
  console.warn(`[history] shallow clone (${commits.length} < ${previous.length} commits), keeping existing snapshot`);
} else {
  writeFileSync(OUT, JSON.stringify(commits, null, 2) + "\n");
  console.log(`[history] wrote ${commits.length} commits to ${OUT}`);
}
