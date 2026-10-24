import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { planSetupEnv } from "./setup-env.lib.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(scriptDir, "..");
const envPath = join(backendRoot, ".env");
const examplePath = join(backendRoot, ".env.example");

try {
  const exampleContent = readFileSync(examplePath, "utf8");
  const result = planSetupEnv({ envPath, examplePath, exampleContent });
  console.log(result.message);
  console.log(`Wrote: ${result.envPath}`);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("setup:env failed.");
  }
  process.exitCode = 1;
}
