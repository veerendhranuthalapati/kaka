import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";

const BASE64_CHARSET = /^[A-Za-z0-9+/]*={0,2}$/;

export function generateSecret(byteLength) {
  if (!Number.isInteger(byteLength) || byteLength < 1) {
    throw new Error("byteLength must be a positive integer");
  }
  return randomBytes(byteLength).toString("base64");
}

export function isValidGeneratedSecret(value, byteLength) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  const expectedMinLength = Math.ceil((byteLength * 4) / 3);
  if (value.length < expectedMinLength) {
    return false;
  }
  return BASE64_CHARSET.test(value);
}

function generateAdminPassword(length) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function applyEnvTemplate(template, { jwtSecret, adminPassword, adminEmail }) {
  return template
    .split(/\r?\n/)
    .map((line) => {
      if (line.startsWith("JWT_SECRET=")) {
        return `JWT_SECRET=${jwtSecret}`;
      }
      if (line.startsWith("ADMIN_EMAIL=")) {
        return `ADMIN_EMAIL=${adminEmail}`;
      }
      if (line.startsWith("ADMIN_PASSWORD=")) {
        return `ADMIN_PASSWORD=${adminPassword}`;
      }
      return line;
    })
    .join("\n");
}

export function planSetupEnv({
  envPath,
  examplePath,
  exampleContent,
  adminEmail = "admin@autoyard.local",
}) {
  if (existsSync(envPath)) {
    throw new Error(`.env already exists at ${envPath}; refusing to overwrite.`);
  }

  const jwtSecret = generateSecret(48);
  const adminPassword = generateAdminPassword(20);
  const body = applyEnvTemplate(exampleContent, {
    jwtSecret,
    adminPassword,
    adminEmail,
  });

  writeFileSync(envPath, `${body}\n`, "utf8");

  return {
    created: true,
    envPath,
    examplePath,
    message:
      "Created .env from .env.example. Open backend/.env locally to read ADMIN_EMAIL and ADMIN_PASSWORD (values are never printed to the console).",
  };
}
