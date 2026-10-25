#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { relative, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const IGNORE_FILE = resolve(ROOT, ".secretscanignore");

const PRIVATE_KEY_RE = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
const JWT_RE = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;
const AWS_KEY_RE = /AKIA[0-9A-Z]{16}/;
const POSTGRES_RE = /postgres(?:ql)?:\/\/([^:\s]+):([^@\s]+)@/gi;
const PLACEHOLDER_PASSWORDS = new Set([
  "postgres",
  "password",
  "replace-me",
  "changeme",
  "pass",
  "p",
]);
const SECRET_ASSIGN_RE =
  /^(?:[A-Z0-9_]*(?:SECRET|PASSWORD|KEY))=(.+)$/im;

function loadIgnorePatterns() {
  if (!existsSync(IGNORE_FILE)) return [];
  return readFileSync(IGNORE_FILE, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function ignored(path, patterns) {
  const rel = relative(ROOT, path).replace(/\\/g, "/");
  return patterns.some((pattern) => {
    if (pattern.includes("*")) {
      const re = new RegExp(
        `^${pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*")}$`,
      );
      return re.test(rel);
    }
    return rel === pattern || rel.endsWith(`/${pattern}`);
  });
}

function isHighEntropy(value) {
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  if (trimmed.length < 16) return false;
  const distinct = new Set(trimmed).size;
  return distinct >= 12;
}

export function scanContent(path, content, patterns = loadIgnorePatterns()) {
  const findings = [];
  if (ignored(path, patterns)) return findings;

  const rel = relative(ROOT, path).replace(/\\/g, "/");
  const isExample = rel.includes(".example");

  if (PRIVATE_KEY_RE.test(content)) {
    findings.push({ file: rel, rule: "private_key_header" });
  }
  if (JWT_RE.test(content)) {
    findings.push({ file: rel, rule: "jwt_token" });
  }
  if (AWS_KEY_RE.test(content)) {
    findings.push({ file: rel, rule: "aws_access_key" });
  }

  for (const match of content.matchAll(POSTGRES_RE)) {
    const password = match[2] ?? "";
    if (password && !PLACEHOLDER_PASSWORDS.has(password.toLowerCase())) {
      findings.push({ file: rel, rule: "postgres_url_password" });
      break;
    }
  }

  if (!isExample) {
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(SECRET_ASSIGN_RE);
      if (!m) continue;
      const value = m[1];
      if (isHighEntropy(value)) {
        findings.push({ file: rel, rule: "high_entropy_secret_assignment" });
        break;
      }
    }
  }

  return findings;
}

export function scanFiles(files, patterns = loadIgnorePatterns()) {
  const all = [];
  for (const file of files) {
    const abs = resolve(ROOT, file);
    if (!existsSync(abs)) continue;
    const content = readFileSync(abs, "utf8");
    all.push(...scanContent(abs, content, patterns));
  }
  return all;
}

function listGitFiles() {
  return execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function main() {
  const cliPaths = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const files =
    cliPaths.length > 0
      ? cliPaths
      : listGitFiles();
  const findings = scanFiles(files);
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`${finding.file}: ${finding.rule}`);
    }
    process.exit(1);
  }
  console.log("check:secrets passed");
}

if (process.argv[1]?.includes("check-secrets.mjs")) {
  main();
}
