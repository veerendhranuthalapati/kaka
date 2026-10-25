import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { buildHostingSecurityHeaders } from "./src/security/hostingHeaders";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const previewHeaders = buildHostingSecurityHeaders(env.VITE_API_URL);

  return {
    plugins: [react()],
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-router")) return "vendor-router";
              if (id.includes("react-dom") || id.includes("/react/"))
                return "vendor-react";
              return "vendor";
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      headers: previewHeaders,
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: false,
      restoreMocks: true,
      testTimeout: 15_000,
      coverage: {
        provider: "v8",
        exclude: [
          "src/components/HeroCarousel.tsx",
          "src/components/scroll-car/ScrollCar.tsx",
          "src/components/scroll-car/ScrollCarDoodle.tsx",
          "src/components/scroll-car/useScrollCar.ts",
          "src/pages/admin/**",
        ],
        thresholds: {
          lines: 80,
          statements: 80,
          branches: 70,
          functions: 75,
        },
      },
    },
  };
});
