import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { DEMO_VEHICLE_CATALOG } from "../src/demo/catalog.js";
import { escapeHtml } from "./car-photos.lib.js";
import { demoVehicleImageSlug } from "./seed-demo.lib.js";

type CandidateCache = Record<
  string,
  {
    chosenIndex: number;
    candidates: Array<{
      title: string;
      author: string;
      licenseShortName: string;
      width: number;
      height: number;
      thumbUrl: string;
    }>;
  }
>;

const repoRoot = resolve(process.cwd(), "..");
const cachePath = join(repoRoot, ".cache", "car-photo-candidates.json");
const outPath = join(repoRoot, "docs", "design", "photo-review.html");

function loadCache(): CandidateCache {
  try {
    return JSON.parse(readFileSync(cachePath, "utf8")) as CandidateCache;
  } catch {
    return {};
  }
}

function main(): void {
  const cache = loadCache();
  mkdirSync(join(repoRoot, "docs", "design"), { recursive: true });

  const sections = DEMO_VEHICLE_CATALOG.map((vehicle) => {
    const slug = demoVehicleImageSlug(vehicle.make, vehicle.model);
    const entry = cache[slug];
    const candidates = entry?.candidates ?? [];
    const chosen = entry?.chosenIndex ?? 1;
    const cards = candidates
      .map((candidate, index) => {
        const num = index + 1;
        const selected = num === chosen ? " (chosen)" : "";
        return `<div class="card">
          <h3>#${num}${selected}</h3>
          <img src="${escapeHtml(candidate.thumbUrl)}" alt="" width="320" loading="lazy" />
          <p>${escapeHtml(candidate.title)}</p>
          <p>${escapeHtml(candidate.author)} · ${escapeHtml(candidate.licenseShortName)}</p>
          <p>${candidate.width}×${candidate.height}</p>
        </div>`;
      })
      .join("");

    return `<section>
      <h2>${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)}</h2>
      <p>Slug: ${escapeHtml(slug)}</p>
      ${cards || "<p>No candidates cached yet — run fetch:car-photos first.</p>"}
    </section>`;
  });

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><title>Photo review</title>
<style>body{font-family:system-ui;margin:1rem}section{margin:2rem 0;border-top:1px solid #ccc;padding-top:1rem}.card{display:inline-block;vertical-align:top;width:340px;margin:0.5rem;padding:0.5rem;border:1px solid #ddd}</style>
</head><body><h1>Car photo review</h1>${sections.join("")}</body></html>`;

  writeFileSync(outPath, html, "utf8");
  console.log(`Wrote ${outPath}`);
}

main();
