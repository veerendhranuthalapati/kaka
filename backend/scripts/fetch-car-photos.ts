import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  assertCategoryCoverage,
  buildManifestEntry,
  categoryPhotoFilename,
  isJpegBuffer,
  isPhotoByteSizeValid,
  MAX_TOTAL_PHOTO_BYTES,
  parseCommonsCandidates,
  passesCandidateFilters,
  scoreCandidate,
  sha256Hex,
  photoAcceptableForDemoVehicle,
  type CarPhotoManifest,
  type CarPhotoManifestEntry,
  vehiclePhotoFilename,
} from "./car-photos.lib.js";
import { DEMO_VEHICLE_CATALOG } from "./seed-demo.lib.js";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const REQUEST_GAP_MS = 500;
const TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const THUMB_WIDTHS = [800, 640, 1024];

type SelectionRow = {
  vehicle: string;
  query: string;
  fileTitle: string;
  license: string;
  sizeKb: number;
  visual: string;
  fallback: string;
};

function userAgent(): string {
  const contact = process.env.COMMONS_CONTACT?.trim();
  if (!contact) {
    throw new Error("COMMONS_CONTACT is required in backend/.env");
  }
  return `AutoYardKataDemo/1.0 (educational project; ${contact})`;
}

function assertAllowedUrl(url: string): void {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error(`Only https URLs allowed: ${parsed.hostname}`);
  }
  const allowed = [
    "commons.wikimedia.org",
    "upload.wikimedia.org",
    "thumb.wikimedia.org",
  ];
  if (!allowed.includes(parsed.hostname)) {
    throw new Error(`Host not allowed: ${parsed.hostname}`);
  }
}

async function fetchWithRetry(url: string, accept?: string): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent(),
          ...(accept ? { Accept: accept } : {}),
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "2");
        await delay(Math.max(retryAfter, 1) * 1000);
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return response;
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error;
      await delay(REQUEST_GAP_MS * attempt);
    }
  }
  throw new Error("Unreachable");
}

async function searchCommons(query: string): Promise<ReturnType<typeof parseCommonsCandidates>> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|thumbmime|size|extmetadata",
    iiurlwidth: "1280",
    origin: "*",
  });
  const url = `${COMMONS_API}?${params.toString()}`;
  assertAllowedUrl(url);
  await delay(REQUEST_GAP_MS);
  const response = await fetchWithRetry(url);
  const json = (await response.json()) as Parameters<typeof parseCommonsCandidates>[0];
  return parseCommonsCandidates(json);
}

async function thumbUrlForTitle(title: string, width: number): Promise<string> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|size|thumbmime",
    iiurlwidth: String(width),
    origin: "*",
  });
  const url = `${COMMONS_API}?${params.toString()}`;
  assertAllowedUrl(url);
  await delay(REQUEST_GAP_MS);
  const response = await fetchWithRetry(url);
  const json = (await response.json()) as {
    query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string }> }> };
  };
  const pages = json.query?.pages ?? {};
  const info = Object.values(pages)[0]?.imageinfo?.[0];
  if (!info?.thumburl) {
    throw new Error(`No thumb for ${title} at ${width}px`);
  }
  return info.thumburl;
}

async function downloadResizedJpeg(thumbUrl: string): Promise<Buffer> {
  assertAllowedUrl(thumbUrl);
  await delay(REQUEST_GAP_MS);
  const response = await fetchWithRetry(thumbUrl, "image/jpeg");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!isJpegBuffer(buffer) || !isPhotoByteSizeValid(buffer.length)) {
    throw new Error(`JPEG size/magic invalid (${buffer.length} bytes)`);
  }
  return buffer;
}

async function downloadPhotoForTitle(title: string): Promise<Buffer> {
  for (const width of THUMB_WIDTHS) {
    try {
      const thumbUrl = await thumbUrlForTitle(title, width);
      return await downloadResizedJpeg(thumbUrl);
    } catch {
      continue;
    }
  }
  throw new Error(`Could not download ${title} within size limits`);
}

const DEMO_MAKES = [...new Set(DEMO_VEHICLE_CATALOG.map((entry) => entry.make))];

function pickBestCandidate(
  candidates: ReturnType<typeof parseCommonsCandidates>,
  make?: string,
  model?: string,
  vehicleCategory?: string,
) {
  const filtered = candidates
    .filter((candidate) =>
      passesCandidateFilters({
        mime: candidate.mime,
        width: candidate.width,
        height: candidate.height,
        title: candidate.title,
        description: candidate.description,
        licenseShortName: candidate.licenseShortName,
        artistHtml: candidate.artistHtml,
      }),
    )
    .filter((candidate) =>
      make && model && vehicleCategory
        ? photoAcceptableForDemoVehicle({
            title: candidate.title,
            categories: [],
            make,
            model,
            vehicleCategory,
            demoMakes: DEMO_MAKES,
          })
        : true,
    )
    .sort((a, b) => {
      const scoreDiff =
        scoreCandidate({
          licenseShortName: b.licenseShortName,
          width: b.width,
          title: b.title,
        }) -
        scoreCandidate({
          licenseShortName: a.licenseShortName,
          width: a.width,
          title: a.title,
        });
      if (scoreDiff !== 0) return scoreDiff;
      return b.width - a.width;
    });
  return filtered[0] ?? null;
}

function categorySlug(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, "-");
}

async function main(): Promise<void> {
  const repoRoot = resolve(process.cwd(), "..");
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  const manifestPath = join(repoRoot, "frontend", "src", "data", "car-photos.json");
  mkdirSync(carsDir, { recursive: true });
  mkdirSync(join(repoRoot, "frontend", "src", "data"), { recursive: true });

  const categories = [...new Set(DEMO_VEHICLE_CATALOG.map((entry) => entry.category))];
  const manifest: CarPhotoManifest = { photos: [] };
  const hashes = new Set<string>();
  let totalBytes = 0;
  const rows: SelectionRow[] = [];
  const vehicleOwnPhoto = new Map<string, string>();

  for (const vehicle of DEMO_VEHICLE_CATALOG) {
    const label = `${vehicle.make} ${vehicle.model}`;
    const queries = [
      `${vehicle.make} ${vehicle.model} car`,
      `File:${vehicle.make} ${vehicle.model}`,
    ];
    let chosen: ReturnType<typeof pickBestCandidate> = null;
    let usedQuery = "";
    for (const query of queries) {
      const candidates = await searchCommons(query);
      chosen = pickBestCandidate(
        candidates,
        vehicle.make,
        vehicle.model,
        vehicle.category,
      );
      if (chosen) {
        usedQuery = query;
        break;
      }
    }

    if (!chosen) {
      rows.push({
        vehicle: label,
        query: queries.join(" | "),
        fileTitle: "(none)",
        license: "-",
        sizeKb: 0,
        visual: "UNVERIFIED-VISUAL",
        fallback: "category photo",
      });
      continue;
    }

    const filename = vehiclePhotoFilename(vehicle.make, vehicle.model);
    let buffer: Buffer | null = null;
    try {
      buffer = await downloadPhotoForTitle(chosen.title);
    } catch {
      buffer = null;
    }
    if (!buffer) {
      rows.push({
        vehicle: label,
        query: usedQuery,
        fileTitle: chosen.title,
        license: chosen.licenseShortName,
        sizeKb: 0,
        visual: "UNVERIFIED-VISUAL",
        fallback: "category photo (download failed)",
      });
      continue;
    }

    const hash = sha256Hex(buffer);
    if (hashes.has(hash)) continue;
    if (totalBytes + buffer.length > MAX_TOTAL_PHOTO_BYTES) {
      throw new Error("Total photo budget exceeded");
    }

    writeFileSync(join(carsDir, filename), buffer);
    hashes.add(hash);
    totalBytes += buffer.length;
    vehicleOwnPhoto.set(label, filename);

    const entry = buildManifestEntry({
      file: filename,
      category: vehicle.category,
      make: vehicle.make,
      model: vehicle.model,
      width: chosen.thumbWidth || chosen.width,
      height: chosen.thumbHeight || chosen.height,
      title: chosen.title,
      authorHtml: chosen.artistHtml,
      licenseShortName: chosen.licenseShortName,
      licenseUrl: chosen.licenseUrl,
      descriptionUrl: chosen.descriptionUrl,
      sourceUrl: chosen.sourceUrl,
      notes: "UNVERIFIED-VISUAL",
    });
    manifest.photos.push(entry);

    rows.push({
      vehicle: label,
      query: usedQuery,
      fileTitle: chosen.title,
      license: chosen.licenseShortName,
      sizeKb: Math.round(buffer.length / 1024),
      visual: "UNVERIFIED-VISUAL",
      fallback: "own photo",
    });
  }

  const countCategoryFillers = (category: string) =>
    manifest.photos.filter(
      (photo) =>
        photo.category.toLowerCase() === category.toLowerCase() &&
        !photo.make?.trim() &&
        !photo.model?.trim(),
    ).length;

  const fillerQueries = (category: string) => [
    `${category} car exterior filetype:bitmap`,
    `${category} automobile side view filetype:bitmap`,
    `${category} vehicle filetype:bitmap`,
    `four door ${category} filetype:bitmap`,
  ];

  for (const category of categories) {
    let index = 1;
    let attempts = 0;
    let queryIndex = 0;
    while (countCategoryFillers(category) < 2 && attempts < 24) {
      attempts += 1;
      const query = fillerQueries(category)[queryIndex % fillerQueries(category).length];
      queryIndex += 1;
      const candidates = await searchCommons(query);
      const chosen = pickBestCandidate(candidates);
      if (!chosen) continue;

      const filename = categoryPhotoFilename(category, index);
      if (manifest.photos.some((photo) => photo.file === filename)) {
        index += 1;
        continue;
      }
      if (manifest.photos.some((photo) => photo.title === chosen.title)) {
        index += 1;
        continue;
      }

      let buffer: Buffer | null = null;
      try {
        buffer = await downloadPhotoForTitle(chosen.title);
      } catch {
        buffer = null;
      }
      if (!buffer) continue;

      const hash = sha256Hex(buffer);
      if (hashes.has(hash)) {
        index += 1;
        continue;
      }
      if (totalBytes + buffer.length > MAX_TOTAL_PHOTO_BYTES) break;

      writeFileSync(join(carsDir, filename), buffer);
      hashes.add(hash);
      totalBytes += buffer.length;
      manifest.photos.push(
        buildManifestEntry({
          file: filename,
          category,
          width: chosen.thumbWidth || chosen.width,
          height: chosen.thumbHeight || chosen.height,
          title: chosen.title,
          authorHtml: chosen.artistHtml,
          licenseShortName: chosen.licenseShortName,
          licenseUrl: chosen.licenseUrl,
          descriptionUrl: chosen.descriptionUrl,
          sourceUrl: chosen.sourceUrl,
          notes: "UNVERIFIED-VISUAL category filler",
        }),
      );
      index += 1;
    }

    attempts = 0;
    queryIndex = 0;
    while (countCategoryFillers(category) < 3 && attempts < 16) {
      attempts += 1;
      const query = fillerQueries(category)[queryIndex % fillerQueries(category).length];
      queryIndex += 1;
      const candidates = await searchCommons(query);
      const chosen = pickBestCandidate(candidates);
      if (!chosen) continue;
      const filename = categoryPhotoFilename(category, index);
      if (manifest.photos.some((photo) => photo.file === filename || photo.title === chosen.title)) {
        index += 1;
        continue;
      }
      let buffer: Buffer | null = null;
      try {
        buffer = await downloadPhotoForTitle(chosen.title);
      } catch {
        buffer = null;
      }
      if (!buffer) continue;
      const hash = sha256Hex(buffer);
      if (hashes.has(hash)) {
        index += 1;
        continue;
      }
      if (totalBytes + buffer.length > MAX_TOTAL_PHOTO_BYTES) break;
      writeFileSync(join(carsDir, filename), buffer);
      hashes.add(hash);
      totalBytes += buffer.length;
      manifest.photos.push(
        buildManifestEntry({
          file: filename,
          category,
          width: chosen.thumbWidth || chosen.width,
          height: chosen.thumbHeight || chosen.height,
          title: chosen.title,
          authorHtml: chosen.artistHtml,
          licenseShortName: chosen.licenseShortName,
          licenseUrl: chosen.licenseUrl,
          descriptionUrl: chosen.descriptionUrl,
          sourceUrl: chosen.sourceUrl,
          notes: "UNVERIFIED-VISUAL category filler",
        }),
      );
      index += 1;
    }
  }

  assertCategoryCoverage(manifest, categories);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log("\nVehicle photo selections:\n");
  console.log(
    "| Vehicle | Query | File title | Licence | Size (KB) | Visual | Fallback |",
  );
  console.log("| --- | --- | --- | --- | --- | --- | --- |");
  for (const row of rows) {
    console.log(
      `| ${row.vehicle} | ${row.query} | ${row.fileTitle} | ${row.license} | ${row.sizeKb} | ${row.visual} | ${row.fallback} |`,
    );
  }
  console.log(`\nTotal photo bytes: ${totalBytes} (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Manifest entries: ${manifest.photos.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
