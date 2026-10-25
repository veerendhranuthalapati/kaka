import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts",
        "src/server.ts",
        "src/server/**",
        "src/lib/prisma.ts",
        "src/security/routeAudit.ts",
      ],
      thresholds: {
        lines: 88,
        statements: 87,
        branches: 78,
        functions: 85,
      },
    },
  },
});
