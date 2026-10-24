import { createHash } from "node:crypto";

export const REJECT_TITLE_KEYWORDS = [
  "interior",
  "dashboard",
  "cockpit",
  "engine",
  "wheel",
  "logo",
  "badge",
  "detail",
  "concept",
  "prototype",
  "crash",
  "wreck",
  "rally",
  "race",
  "racing",
  "tuning",
  "tuned",
  "police",
  "taxi",
  "ambulance",
  "bus",
  "toy",
  "diecast",
  "model car",
  "drawing",
  "sketch",
  "brochure",
  "advert",
  "museum",
  "show car",
  "art car",
] as const;

export const MIN_PHOTO_BYTES = 40 * 1024;
export const MAX_PHOTO_BYTES = 300 * 1024;
export const MAX_TOTAL_PHOTO_BYTES = 12 * 1024 * 1024;
export const MIN_CATEGORY_PHOTOS = 2;
export const MAX_CATEGORY_PHOTOS = 3;
export const MIN_IMAGE_WIDTH = 1200;
export const MIN_ASPECT_RATIO = 1.3;
export const MAX_ASPECT_RATIO = 2.35;

export type CarPhotoManifestEntry = {
  file: string;
  category: string;
  make?: string | null;
  model?: string | null;
  width: number;
  height: number;
  title: string;
  author: string;
  licenseShortName: string;
  licenseUrl: string;
  descriptionUrl: string;
  sourceUrl: string;
  resized: boolean;
  notes?: string;
  commonsCategories?: string[];
};

export type CarPhotoManifest = {
  photos: CarPhotoManifestEntry[];
};

export type CommonsSearchPage = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        imageinfo?: Array<{
          url?: string;
          thumburl?: string;
          thumbwidth?: number;
          thumbheight?: number;
          width?: number;
          height?: number;
          mime?: string;
          extmetadata?: Record<string, { value?: string }>;
        }>;
      }
    >;
  };
};

export function isLicenseAmbiguous(licenseShortName: string): boolean {
  const normalized = licenseShortName.trim();
  if (!normalized) return true;
  if (/\bor\b/i.test(normalized) && (/cc by/i.test(normalized) || /cc-by/i.test(normalized))) {
    return true;
  }
  if (/\bor\b/i.test(normalized) && /,/i.test(normalized)) return true;
  if (normalized.includes("|")) return true;
  if (/multi/i.test(normalized)) return true;
  return false;
}

export function isLicenseAllowed(licenseShortName: string): boolean {
  const s = licenseShortName.trim();
  if (!s || isLicenseAmbiguous(s)) return false;

  const lower = s.toLowerCase();
  if (/\bby-nc\b/i.test(s) || /\bby-nd\b/i.test(s) || /-nc\b/i.test(s) || /-nd\b/i.test(s)) {
    return false;
  }
  const blocked = [
    "fair use",
    "non-free",
    "non free",
    "all rights reserved",
    "copyrighted",
  ];
  for (const token of blocked) {
    if (lower.includes(token)) return false;
  }
  if (lower.includes("gfdl") && !lower.includes("cc")) return false;
  if (lower.includes("gfdl") && !lower.includes("cc")) return false;

  const allowedPatterns = [
    /\bcc0\b/i,
    /^cc-zero$/i,
    /public domain/i,
    /\bpdm\b/i,
    /pd-self/i,
    /cc by-sa/i,
    /cc-by-sa/i,
    /cc by\b/i,
    /cc-by\b/i,
    /creative commons attribution/i,
  ];
  return allowedPatterns.some((pattern) => pattern.test(s));
}

export function htmlToPlainAuthor(html: string): string {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  const withoutTags = withoutScripts.replace(/<[^>]+>/g, " ");
  const decoded = withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
  const collapsed = decoded.replace(/\s+/g, " ").trim();
  if (collapsed.length <= 120) return collapsed;
  return `${collapsed.slice(0, 117)}...`;
}

export function slugPhotoFilename(part: string): string {
  return part
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");
}

export function vehiclePhotoFilename(make: string, model: string): string {
  const slug = slugPhotoFilename(`${make}-${model}`);
  if (!slug || slug.includes("..")) {
    throw new Error("Invalid vehicle photo slug");
  }
  return `${slug}.jpg`;
}

export function categoryPhotoFilename(category: string, index: number): string {
  const slug = slugPhotoFilename(category);
  if (!slug || slug.includes("..")) {
    throw new Error("Invalid category photo slug");
  }
  return `${slug}-${index}.jpg`;
}

export function assertSafePublicPath(filename: string): void {
  if (!/^[a-z0-9-]+\.jpg$/i.test(filename)) {
    throw new Error(`Unsafe photo filename: ${filename}`);
  }
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    throw new Error(`Path traversal rejected: ${filename}`);
  }
}

export function normalizePhotoMatchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactPhotoMatchText(text: string): string {
  return normalizePhotoMatchText(text).replace(/\s+/g, "");
}

export function titleContainsMakeModel(
  title: string,
  make: string,
  model: string,
): boolean {
  return photoTextContainsMakeAndModel(title, [], make, model);
}

function photoTokenPresent(spacedHay: string, compactHay: string, token: string): boolean {
  const normalized = token.replace(/\s+/g, "");
  if (normalized.length <= 2) {
    const pattern = new RegExp(
      `(^|[^a-z0-9])${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`,
    );
    return pattern.test(` ${spacedHay} `);
  }
  if (spacedHay.includes(token)) return true;
  return compactHay.includes(normalized);
}

export function photoTextContainsMakeAndModel(
  title: string,
  categories: string[],
  make: string,
  model: string,
): boolean {
  const spacedHay = normalizePhotoMatchText(`${title} ${categories.join(" ")}`);
  const compactHay = spacedHay.replace(/\s+/g, "");
  const makeWords = normalizePhotoMatchText(make).split(/\s+/).filter(Boolean);
  const modelWords = normalizePhotoMatchText(model).split(/\s+/).filter(Boolean);
  const compactModel = modelWords.join("");
  const makeOk = makeWords.every((word) =>
    photoTokenPresent(spacedHay, compactHay, word),
  );
  const modelOk =
    modelWords.every((word) => photoTokenPresent(spacedHay, compactHay, word)) ||
    (compactModel.length > 3 && compactHay.includes(compactModel));
  return makeOk && modelOk;
}

export function photoContainsOtherDemoMake(
  title: string,
  categories: string[],
  vehicleMake: string,
  demoMakes: string[],
): boolean {
  const hay = ` ${normalizePhotoMatchText(`${title} ${categories.join(" ")}`)} `;
  const own = normalizePhotoMatchText(vehicleMake);
  for (const make of demoMakes) {
    const normalized = normalizePhotoMatchText(make);
    if (normalized === own) continue;
    for (const word of normalized.split(/\s+/).filter(Boolean)) {
      if (word.length < 3) continue;
      if (hay.includes(` ${word} `) || hay.includes(`${word} `) || hay.endsWith(` ${word}`)) {
        return true;
      }
    }
    if (normalized.length >= 4 && hay.includes(normalized)) {
      return true;
    }
  }
  return false;
}

export function photoMatchesDemoVehicle(
  title: string,
  categories: string[],
  make: string,
  model: string,
  demoMakes: string[],
): boolean {
  if (!photoTextContainsMakeAndModel(title, categories, make, model)) {
    return false;
  }
  if (photoContainsOtherDemoMake(title, categories, make, demoMakes)) {
    return false;
  }
  return true;
}

const BODY_TYPE_HINTS: Record<string, string[]> = {
  suv: ["suv", "crossover", "4x4"],
  sedan: ["sedan", "saloon"],
  hatchback: ["hatchback", "hatch"],
  truck: ["truck", "pickup", "pick-up"],
  coupe: ["coupe", "convertible"],
  ev: ["electric", "ev", "bev"],
  wagon: ["wagon", "estate", "combi", "touring", "avant"],
};

export function photoConflictsWithCategory(
  title: string,
  categories: string[],
  vehicleCategory: string,
): boolean {
  const hay = normalizePhotoMatchText(`${title} ${categories.join(" ")}`);
  const key = normalizeCategoryKey(vehicleCategory);
  const expected = BODY_TYPE_HINTS[key] ?? [];
  if (expected.length === 0) return false;

  const conflicts: Record<string, string[]> = {
    wagon: ["suv", "crossover", "pickup", "truck", "coupe"],
    sedan: ["suv", "pickup", "truck", "hatchback"],
    hatchback: ["suv", "pickup", "truck"],
    coupe: ["suv", "pickup", "truck", "wagon"],
    truck: ["sedan", "hatchback", "coupe", "wagon"],
    suv: ["sedan", "hatchback", "coupe", "pickup"],
    ev: [],
  };
  const bad = conflicts[key] ?? [];
  const hasExpected = expected.some((token) => hay.includes(token));
  const hasConflict = bad.some((token) => hay.includes(token));
  if (hasConflict && !hasExpected) return true;
  if (key === "wagon" && hay.includes("pilot") && !hay.includes("combi") && !hay.includes("estate")) {
    return true;
  }
  return false;
}

export function photoAcceptableForDemoVehicle(input: {
  title: string;
  categories: string[];
  make: string;
  model: string;
  vehicleCategory: string;
  demoMakes: string[];
}): boolean {
  return (
    photoMatchesDemoVehicle(
      input.title,
      input.categories,
      input.make,
      input.model,
      input.demoMakes,
    ) && !photoConflictsWithCategory(input.title, input.categories, input.vehicleCategory)
  );
}

export function textContainsRejectedKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return REJECT_TITLE_KEYWORDS.some((keyword) => {
    const pattern = new RegExp(`\\b${keyword.replace(/\s+/g, "\\s+")}\\b`, "i");
    return pattern.test(lower);
  });
}

export function isLandscapeAspectRatio(width: number, height: number): boolean {
  if (width <= 0 || height <= 0) return false;
  const ratio = width / height;
  return ratio >= MIN_ASPECT_RATIO && ratio <= MAX_ASPECT_RATIO;
}

export function isJpegBuffer(buffer: Buffer): boolean {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

export function isPhotoByteSizeValid(size: number): boolean {
  return size >= MIN_PHOTO_BYTES && size <= MAX_PHOTO_BYTES;
}

export function sha256Hex(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export type CandidateScoreInput = {
  licenseShortName: string;
  width: number;
  title: string;
};

export function licensePreferenceScore(licenseShortName: string): number {
  const lower = licenseShortName.toLowerCase();
  if (/cc0|public domain|pdm|pd-self/i.test(lower)) return 3;
  if (/cc by-sa|cc-by-sa/i.test(lower)) return 1;
  if (/cc by|cc-by/i.test(lower)) return 2;
  return 0;
}

export function scoreCandidate(input: CandidateScoreInput): number {
  let score = licensePreferenceScore(input.licenseShortName);
  if (input.width >= 1600) score += 1;
  if (/front|three.?quarter|3\/4/i.test(input.title)) score += 1;
  return score;
}

export function passesCandidateFilters(input: {
  mime?: string;
  width: number;
  height: number;
  title: string;
  description?: string;
  licenseShortName: string;
  artistHtml?: string;
}): boolean {
  if (input.mime?.toLowerCase() !== "image/jpeg") return false;
  if (input.width < MIN_IMAGE_WIDTH) return false;
  if (!isLandscapeAspectRatio(input.width, input.height)) return false;
  if (!isLicenseAllowed(input.licenseShortName)) return false;
  const artist = htmlToPlainAuthor(input.artistHtml ?? "");
  if (!artist) return false;
  const combined = `${input.title} ${input.description ?? ""}`;
  if (textContainsRejectedKeyword(combined)) return false;
  return true;
}

export function normalizeCategoryKey(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isCategoryFillerPhoto(photo: CarPhotoManifestEntry): boolean {
  return !photo.make?.trim() && !photo.model?.trim();
}

export function countPhotosPerCategory(
  manifest: CarPhotoManifest,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const photo of manifest.photos) {
    const key = normalizeCategoryKey(photo.category);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function countCategoryFillerPhotosPerCategory(
  manifest: CarPhotoManifest,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const photo of manifest.photos) {
    if (!isCategoryFillerPhoto(photo)) continue;
    const key = normalizeCategoryKey(photo.category);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function assertCategoryCoverage(
  manifest: CarPhotoManifest,
  categories: string[],
): void {
  const counts = countCategoryFillerPhotosPerCategory(manifest);
  for (const category of categories) {
    const key = normalizeCategoryKey(category);
    const count = counts.get(key) ?? 0;
    if (count < MIN_CATEGORY_PHOTOS || count > MAX_CATEGORY_PHOTOS) {
      throw new Error(
        `Category ${category} has ${count} photos; expected ${MIN_CATEGORY_PHOTOS}-${MAX_CATEGORY_PHOTOS}`,
      );
    }
  }
}

export function buildManifestEntry(input: {
  file: string;
  category: string;
  make?: string | null;
  model?: string | null;
  width: number;
  height: number;
  title: string;
  authorHtml: string;
  licenseShortName: string;
  licenseUrl: string;
  descriptionUrl: string;
  sourceUrl: string;
  notes?: string;
  commonsCategories?: string[];
}): CarPhotoManifestEntry {
  assertSafePublicPath(input.file);
  const author = htmlToPlainAuthor(input.authorHtml);
  if (!author) {
    throw new Error("Author required for manifest entry");
  }
  if (!isLicenseAllowed(input.licenseShortName)) {
    throw new Error(`License not allowed: ${input.licenseShortName}`);
  }
  return {
    file: input.file,
    category: input.category,
    make: input.make ?? null,
    model: input.model ?? null,
    width: input.width,
    height: input.height,
    title: input.title,
    author,
    licenseShortName: input.licenseShortName,
    licenseUrl: input.licenseUrl,
    descriptionUrl: input.descriptionUrl,
    sourceUrl: input.sourceUrl,
    resized: true,
    notes: input.notes,
    commonsCategories: input.commonsCategories,
  };
}

export function parseCommonsCandidates(
  page: CommonsSearchPage,
): Array<{
  title: string;
  width: number;
  height: number;
  mime: string;
  thumbUrl: string;
  thumbWidth: number;
  thumbHeight: number;
  licenseShortName: string;
  licenseUrl: string;
  artistHtml: string;
  descriptionUrl: string;
  sourceUrl: string;
  description: string;
}> {
  const pages = page.query?.pages ?? {};
  const results: Array<{
    title: string;
    width: number;
    height: number;
    mime: string;
    thumbUrl: string;
    thumbWidth: number;
    thumbHeight: number;
    licenseShortName: string;
    licenseUrl: string;
    artistHtml: string;
    descriptionUrl: string;
    sourceUrl: string;
    description: string;
  }> = [];

  for (const entry of Object.values(pages)) {
    const title = entry.title ?? "";
    const info = entry.imageinfo?.[0];
    if (!info?.thumburl) continue;
    const meta = info.extmetadata ?? {};
    const licenseShortName = meta.LicenseShortName?.value ?? "";
    const licenseUrl = meta.LicenseUrl?.value ?? "";
    const artistHtml = meta.Artist?.value ?? "";
    const description = meta.ImageDescription?.value ?? "";
    results.push({
      title,
      width: info.width ?? info.thumbwidth ?? 0,
      height: info.height ?? info.thumbheight ?? 0,
      mime: info.mime ?? (info as { thumbmime?: string }).thumbmime ?? "",
      thumbUrl: info.thumburl,
      thumbWidth: info.thumbwidth ?? 0,
      thumbHeight: info.thumbheight ?? 0,
      licenseShortName,
      licenseUrl,
      artistHtml,
      descriptionUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
      sourceUrl: info.url ?? info.thumburl,
      description,
    });
  }
  return results;
}

export const MAX_TOTAL_PHOTO_BYTES_Q1 = 12 * 1024 * 1024;

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function parsePickOverrides(argv: string[]): Record<string, number> {
  const picks: Record<string, number> = {};
  for (const arg of argv) {
    const match = arg.match(/^--pick=(.+)$/);
    if (!match) continue;
    const [slug, indexRaw] = match[1].split("=");
    const index = Number(indexRaw);
    if (!slug || !Number.isInteger(index) || index < 1 || index > 4) {
      throw new Error(`Invalid --pick value: ${arg}`);
    }
    picks[slug.trim().toLowerCase()] = index;
  }
  return picks;
}

export function commonsCategoriesMatchMakeModel(
  categories: string[],
  make: string,
  model: string,
): boolean {
  const haystack = categories.join(" ").toLowerCase();
  const makeKey = make.toLowerCase();
  const modelKey = model.toLowerCase();
  return haystack.includes(makeKey) || haystack.includes(modelKey);
}

export function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}
