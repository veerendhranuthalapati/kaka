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
  regexp?: RegExp & { fast_slash?: boolean };
  path?: string;
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
]);

function joinPaths(base: string, segment: string): string {
  if (!segment || segment === "/") return base || "/";
  if (segment.startsWith("/")) {
    return `${base}${segment}`.replace(/\/+/g, "/");
  }
  return `${base}/${segment}`.replace(/\/+/g, "/");
}

function mountPath(layer: ExpressLayer): string {
  if (typeof layer.path === "string" && layer.path.length > 0) {
    return layer.path;
  }
  if (layer.regexp?.fast_slash) return "/";
  return "";
}

function collectFromStack(
  stack: ExpressLayer[],
  prefix: string,
  inherited: RequestHandler[],
  out: AuditedRoute[],
): void {
  let chain = [...inherited];

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
      chain = chain.concat(layer.handle);
    }
  }
}

export function listAuditedRoutes(app: Express): AuditedRoute[] {
  const routes: AuditedRoute[] = [];
  const stack = (app as { _router?: { stack: ExpressLayer[] } })._router?.stack;
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
