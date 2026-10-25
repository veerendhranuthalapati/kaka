import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const sourceRoot = new URL("../src", import.meta.url);
const rules = [
  {
    pattern: /dangerouslySetInnerHTML/,
    message: "dangerouslySetInnerHTML is not allowed",
  },
  { pattern: /\binnerHTML\b/, message: "innerHTML is not allowed" },
  { pattern: /\bouterHTML\b/, message: "outerHTML is not allowed" },
  { pattern: /insertAdjacentHTML/, message: "insertAdjacentHTML is not allowed" },
  { pattern: /document\.write\s*\(/, message: "document.write is not allowed" },
  { pattern: /\beval\s*\(/, message: "eval is not allowed" },
  { pattern: /new\s+Function\s*\(/, message: "new Function is not allowed" },
  {
    pattern: /setTimeout\s*\(\s*['"`]/,
    message: "setTimeout with string argument is not allowed",
  },
  {
    pattern: /setInterval\s*\(\s*['"`]/,
    message: "setInterval with string argument is not allowed",
  },
  {
    pattern: /localStorage/,
    message: "use sessionStorage for the auth token",
  },
  {
    pattern: /console\.(log|debug)\s*\(/,
    message: "remove debug logging before committing",
  },
];

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(path)));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

const files = await collect(sourceRoot.pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const violations = [];

for (const file of files) {
  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const rule of rules) {
      if (
        rule.pattern.source === "localStorage" &&
        relative(process.cwd(), file).includes("session.security.test")
      ) {
        continue;
      }
      if (rule.pattern.test(line)) {
        violations.push(
          `${relative(process.cwd(), file)}:${index + 1} ${rule.message}`,
        );
      }
    }
  });
}

if (violations.length > 0) {
  console.error("Lint failed:\n" + violations.join("\n"));
  process.exit(1);
}

console.log(`Lint passed: ${files.length} source files checked.`);
