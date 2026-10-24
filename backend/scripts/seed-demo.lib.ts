import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

export function refuseProductionSeed(nodeEnv: string | undefined): void {
  if (nodeEnv === "production") {
    throw new Error("seed:demo refuses to run in production");
  }
}

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
