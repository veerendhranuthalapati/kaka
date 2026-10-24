import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

export function refuseProductionSeed(nodeEnv: string | undefined): void {
  if (nodeEnv === "production") {
    throw new Error("seed:demo refuses to run in production");
  }
}

export function refuseTestDatabase(databaseUrl: string | undefined): void {
  if (!databaseUrl) {
    return;
  }
  const match = databaseUrl.match(/\/([^/?]+)(?:\?|$)/);
  const databaseName = match?.[1] ?? "";
  if (databaseName.endsWith("_test")) {
    throw new Error("seed:demo refuses to run against a _test database");
  }
}

export function demoVehicleImageSlug(make: string, model: string): string {
  return `${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function listDemoCarImagePaths(repoRoot = resolve(process.cwd(), "..")): string[] {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  if (!existsSync(carsDir)) {
    return [];
  }
  return readdirSync(carsDir)
    .filter((name) => name.endsWith(".svg") && name !== "placeholder.svg")
    .sort()
    .map((name) => `/cars/${name}`);
}

export function listAllCarAssetFilenames(
  repoRoot = resolve(process.cwd(), ".."),
): string[] {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  if (!existsSync(carsDir)) {
    return [];
  }
  return readdirSync(carsDir)
    .filter((name) => name !== "placeholder.svg")
    .sort();
}

export function resolveOptionalDemoImageUrl(
  make: string,
  model: string,
  repoRoot: string,
): string | null {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  const slug = demoVehicleImageSlug(make, model);

  for (const extension of PHOTO_EXTENSIONS) {
    const filename = `${slug}${extension}`;
    if (existsSync(join(carsDir, filename))) {
      return `/cars/${filename}`;
    }
  }

  const svgMatch = `${slug}.svg`;
  if (existsSync(join(carsDir, svgMatch))) {
    return `/cars/${svgMatch}`;
  }

  return null;
}
