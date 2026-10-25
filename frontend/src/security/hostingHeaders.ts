/**
 * Hosting security headers for static SPA deploys (preview / Netlify / Vercel).
 * Dev server intentionally omits strict CSP (Vite HMR needs inline scripts).
 */

export const CSP_STYLE_UNSAFE_INLINE_REASON =
  "Tailwind and inline style attributes require 'unsafe-inline' for style-src; scripts remain strict.";

export const CSP_IMG_HTTPS_REASON =
  "Admins may paste any https image URL for vehicle photos; img-src allows https:.";

export function apiOriginFromBaseUrl(apiBaseUrl: string | undefined): string | null {
  const trimmed = apiBaseUrl?.trim() ?? "";
  if (!trimmed) return null;
  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

export function buildContentSecurityPolicy(apiBaseUrl?: string): string {
  const connectSources = ["'self'"];
  const apiOrigin = apiOriginFromBaseUrl(apiBaseUrl);
  if (apiOrigin) {
    connectSources.push(apiOrigin);
  }

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export type HostingHeaderMap = Record<string, string>;

export function buildHostingSecurityHeaders(
  apiBaseUrl?: string,
): HostingHeaderMap {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(apiBaseUrl),
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  };
}

export function formatNetlifyHeaders(apiBaseUrl?: string): string {
  const headers = buildHostingSecurityHeaders(apiBaseUrl);
  const lines = ["/*"];
  for (const [name, value] of Object.entries(headers)) {
    lines.push(`  ${name}: ${value}`);
  }
  return `${lines.join("\n")}\n`;
}

export type VercelHeadersConfig = {
  headers: Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
  rewrites?: Array<{ source: string; destination: string }>;
};

export function buildVercelJson(
  apiBaseUrl = "https://api.example.com",
): VercelHeadersConfig {
  const security = buildHostingSecurityHeaders(apiBaseUrl);
  return {
    headers: [
      {
        source: "/(.*)",
        headers: Object.entries(security).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ],
    rewrites: [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ],
  };
}
