import express, { type Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "../../src/middleware/errorHandler.js";
import { requireAuth } from "../../src/middleware/requireAuth.js";

function signToken(expiresIn: string = "15m"): string {
  return jwt.sign(
    { sub: "user-1", email: "user@example.com", role: "USER" },
    process.env.JWT_SECRET!,
    { algorithm: "HS256", expiresIn },
  );
}

function protectedApp(): Express {
  const app = express();
  app.get("/protected", requireAuth, (req, res) => {
    res.status(200).json({ user: req.user });
  });
  app.use(errorHandler);
  return app;
}

describe("requireAuth", () => {
  it("rejects requests without a token", async () => {
    const res = await request(protectedApp()).get("/protected");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects a tampered token", async () => {
    const token = signToken();
    const tampered = `${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;

    const res = await request(protectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${tampered}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an expired token", async () => {
    const res = await request(protectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${signToken("-1s")}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatchObject({ code: "UNAUTHORIZED" });
  });
});
