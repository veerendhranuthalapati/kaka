import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildVercelJson,
  formatNetlifyHeaders,
} from "../src/security/hostingHeaders.js";

const apiBase = process.env.VITE_API_URL ?? "https://api.example.com";
const root = resolve(import.meta.dirname, "..");

writeFileSync(
  resolve(root, "public", "_headers"),
  formatNetlifyHeaders(apiBase),
  "utf8",
);
writeFileSync(
  resolve(root, "vercel.json"),
  `${JSON.stringify(buildVercelJson(apiBase), null, 2)}\n`,
  "utf8",
);
console.log("Wrote public/_headers and vercel.json");
