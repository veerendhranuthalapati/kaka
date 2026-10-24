import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  DEMO_VEHICLE_CATALOG,
  resolveOptionalDemoImageUrl,
} from "./seed-demo.lib.js";

const repoRoot = resolve(process.cwd(), "..");
const carsDir = join(repoRoot, "frontend", "public", "cars");

const paths = new Set<string>();
for (const entry of DEMO_VEHICLE_CATALOG) {
  const url =
    resolveOptionalDemoImageUrl(entry.make, entry.model, repoRoot) ??
    entry.imageUrl ??
    null;
  if (url) paths.add(url);
}

let totalBytes = 0;
for (const publicPath of paths) {
  const file = join(carsDir, publicPath.replace(/^\/cars\//, ""));
  if (existsSync(file)) {
    totalBytes += statSync(file).size;
  }
}

console.log(
  JSON.stringify(
    {
      demoVehicles: DEMO_VEHICLE_CATALOG.length,
      uniqueReferencedPaths: paths.size,
      totalImageBytes: totalBytes,
      totalImageMiB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
    },
    null,
    2,
  ),
);
