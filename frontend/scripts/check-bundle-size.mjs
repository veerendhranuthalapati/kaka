import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const dist = join(process.cwd(), "dist");
const assets = join(dist, "assets");

const JS_BUDGET = 110 * 1024;
const CSS_BUDGET = 10 * 1024;

function gzipSize(file) {
  return gzipSync(readFileSync(file)).length;
}

let jsTotal = 0;
let cssTotal = 0;

for (const name of readdirSync(assets)) {
  const file = join(assets, name);
  if (!statSync(file).isFile()) continue;
  if (name.endsWith(".js")) jsTotal += gzipSize(file);
  if (name.endsWith(".css")) cssTotal += gzipSize(file);
}

const report = {
  jsGzipBytes: jsTotal,
  cssGzipBytes: cssTotal,
  jsBudgetBytes: JS_BUDGET,
  cssBudgetBytes: CSS_BUDGET,
};

console.log(JSON.stringify(report, null, 2));

if (jsTotal > JS_BUDGET || cssTotal > CSS_BUDGET) {
  console.error("Bundle size budget exceeded.");
  process.exit(1);
}
