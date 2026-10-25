import type { Express, RequestHandler, Router } from "express";
import type { Role } from "@prisma/client";
import { requireAuth } from "../middleware/requireAuth.js";

export type AuditedRoute = {
  method: string;
  path: string;
  handlers: RequestHandler[];
};

type ExpressLayer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: { handle: RequestHandler }[];
  };
  name?: string;
  handle?: Router & { stack?: ExpressLayer[] };
  regexp?: RegExp;
};

const PUBLIC_ROUTE_KEYS = new Set([
  "GET /health",
  "POST /api/auth/register",
  "POST /api/auth/login",
]);

const ADMIN_ROUTE_KEYS = new Set([
  "POST /api/vehicles",
  "PUT /api/vehicles/:id",
  "DELETE /api/vehicles/:id",
  "POST /api/vehicles/:id/restock",
  "POST /api/admin/demo-vehicles",
]);

function joinPaths(base: string, segment: string): string {
  if (!segment || segment === "/") return base || "/";
  if (segment.startsWith("/")) {
    return `${base}${segment}`.replace(/\/+/g, "/");
  }
  return `${base}/${segment}`.replace(/\/+/g, "/");
}

function nestedRoutePaths(layer: ExpressLayer): string[] {
  const stack = layer.handle?.stack ?? [];
  const paths: string[] = [];
  for (const entry of stack) {
    if (entry.route?.path) {
      paths.push(entry.route.path);
    }
  }
  return paths;
}

/** Express 5 mount layers omit path; infer from child routes. */
function inferRouterMountPrefix(nestedPaths: string[]): string {
  const set = new Set(nestedPaths);
  if (set.has("/register") && set.has("/login")) return "/api/auth";
  if (set.has("/demo-vehicles")) return "/api/admin";
  if (set.has("/search") || set.has("/:id/purchase")) return "/api/vehicles";
  return "";
}

function mountPath(layer: ExpressLayer): string {
  if (typeof (layer as { path?: string }).path === "string") {
    const path = (layer as { path: string }).path;
    if (path) return path;
  }
  if (layer.regexp) {
    if ((layer.regexp as RegExp & { fast_slash?: boolean }).fast_slash) {
      return "/";
    }
    const source = layer.regexp.source;
    const cleaned = source
      .replace(/^\^\\?\/?/, "/")
      .replace(/\\\/\?\(\?=\\\/\|\$\).*$/, "")
      .replace(/\\\//g, "/")
      .replace(/\$$/, "");
    if (cleaned.startsWith("/")) return cleaned === "/?" ? "/" : cleaned;
  }
  return inferRouterMountPrefix(nestedRoutePaths(layer));
}

function collectFromStack(
  stack: ExpressLayer[],
  prefix: string,
  inherited: RequestHandler[],
  out: AuditedRoute[],
): void {
  const chain = [...inherited];

  for (const layer of stack) {
    if (layer.route) {
      const path = joinPaths(prefix, layer.route.path);
      const handlers = chain.concat(
        layer.route.stack.map((entry) => entry.handle),
      );
      for (const [method, enabled] of Object.entries(layer.route.methods)) {
        if (enabled) {
          out.push({ method: method.toUpperCase(), path, handlers });
        }
      }
      continue;
    }

    if (layer.name === "router" && layer.handle?.stack) {
      const nextPrefix = joinPaths(prefix, mountPath(layer));
      collectFromStack(layer.handle.stack, nextPrefix, chain, out);
      continue;
    }

    if (typeof layer.handle === "function") {
      chain.push(layer.handle);
    }
  }
}

function appRouterStack(app: Express): ExpressLayer[] | undefined {
  const withRouter = app as unknown as {
    router?: { stack?: ExpressLayer[] };
    _router?: { stack?: ExpressLayer[] };
  };
  return withRouter.router?.stack ?? withRouter._router?.stack;
}

export function listAuditedRoutes(app: Express): AuditedRoute[] {
  const routes: AuditedRoute[] = [];
  const stack = appRouterStack(app);
  if (!stack) return routes;
  collectFromStack(stack, "", [], routes);
  return routes;
}

export type RequireRoleHandler = RequestHandler & { requiredRole?: Role };

export function routeHasAuth(handlers: RequestHandler[]): boolean {
  return handlers.some((handler) => handler === requireAuth);
}

export function routeHasAdminRole(handlers: RequestHandler[]): boolean {
  return handlers.some(
    (handler) =>
      (handler as RequireRoleHandler).requiredRole === "ADMIN",
  );
}

export function assertAuditedRoutes(routes: AuditedRoute[]): void {
  for (const route of routes) {
    if (!route.path.startsWith("/api/")) continue;
    const key = `${route.method} ${route.path}`;
    if (PUBLIC_ROUTE_KEYS.has(key)) continue;

    if (!routeHasAuth(route.handlers)) {
      throw new Error(`Unguarded API route: ${key}`);
    }

    if (ADMIN_ROUTE_KEYS.has(key) && !routeHasAdminRole(route.handlers)) {
      throw new Error(`Admin route missing requireRole(ADMIN): ${key}`);
    }
  }
}

export function assertExpressRoutesGuarded(app: Express): void {
  assertAuditedRoutes(listAuditedRoutes(app));
}
