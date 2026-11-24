// Assert-based checks for the matching logic and the curl resume. Run: bun run selfcheck
import assert from "node:assert/strict";
import { CHUNKS, fitRank, retrieve, tokenize } from "@/lib/match";
import { GET } from "@/app/cli/route";

assert.deepEqual(tokenize("We use Next.js. And Postgres, NodeJS & C#!"), ["we", "use", "next.js", "and", "postgresql", "node.js", "c#"]);

const fit = fitRank("Senior engineer: Electron, WebRTC, Win32, C# and some Kubernetes. Nice to have: the ability to talk.");
assert.equal(fit.results[0].item.name, "Arcix", "native/WebRTC JD should rank Arcix first");
assert.ok(!fit.wanted.includes("kubernetes"), "unknown skills are ignored, not counted as gaps");
assert.ok(!fit.wanted.includes("the"), "plain English is not a skill");
assert.equal(fitRank("").results.length, 0);
assert.ok(fitRank("Node.js developer").results.some((r) => r.item.kind === "role"), "experience entries rank too");

assert.equal(retrieve("remote desktop input injection")[0].label, "Arcix");
assert.equal(retrieve("what is the weather")[0], undefined, "no overlap returns nothing");
assert.ok(retrieve("x".repeat(300)).length === 0);
assert.ok(CHUNKS.length > 40);

const res = GET(new Request("https://example.com/cli"));
const text = await res.text();
assert.match(text, /Rishabh Vishwakarma/);
assert.match(text, /https:\/\/example\.com\/work\/arcix/);
assert.ok(text.split("\n").every((l) => l.replace(/\x1b\[[0-9;]*m/g, "").length <= 80), "lines fit a terminal");

console.log("selfcheck ok");
