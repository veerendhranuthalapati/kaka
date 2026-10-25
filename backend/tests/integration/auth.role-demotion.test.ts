import express, { type Express } from "express";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler } from "../../src/middleware/errorHandler.js";
import { requireAuth } from "../../src/middleware/requireAuth.js";
import { requireRole } from "../../src/middleware/requireRole.js";
import { prisma } from "../../src/lib/prisma.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

function adminOnlyApp(): Express {
  const app = express();
  app.get(
    "/admin-only",
    requireAuth,
    requireRole("ADMIN"),
    (_req, res) => {
      res.status(200).json({ ok: true });
    },
  );
  app.use(errorHandler);
  return app;
}

describe("role demotion", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("denies admin-only access after demotion in the database", async () => {
    const admin = await createTestUser("ADMIN");
    const ok = await request(adminOnlyApp())
      .get("/admin-only")
      .set("Authorization", admin.auth);
    expect(ok.status).toBe(200);

    await prisma.user.update({
      where: { id: admin.id },
      data: { role: "USER" },
    });

    const denied = await request(adminOnlyApp())
      .get("/admin-only")
      .set("Authorization", admin.auth);
    expect(denied.status).toBe(403);
  });
});
