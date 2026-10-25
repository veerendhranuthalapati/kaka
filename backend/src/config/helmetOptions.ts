import type { HelmetOptions } from "helmet";

export function buildHelmetOptions(nodeEnv: string): HelmetOptions {
  return {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
      },
    },
    hsts:
      nodeEnv === "production"
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: false }
        : false,
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    hidePoweredBy: true,
  };
}
