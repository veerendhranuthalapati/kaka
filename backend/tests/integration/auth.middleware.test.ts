import express, { type Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { config } from "../../src/config/env.js";
import { JWT_ALGORITHM } from "../../src/config/jwt.js";
import { errorHandler } from "../../src/middleware/errorHandler.js";
import { requireAuth } from "../../src/middleware/requireAuth.js";
import { prisma } from "../../src/lib/prisma.js";
import { signAccessToken } from "../../src/services/auth.service.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

function protectedApp(): Express {
  const app = express();
  app.get("/protected", requireAuth, (req, res) => {
    res.status(200).json({ user: req.user });
  });
  app.use(errorHandler);
  return app;
}

describe("requireAuth", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("rejects requests without a token", async () => {
    const res = await request(protectedApp()).get("/protected");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects a tampered token", async () => {
    const user = await createTestUser();
    const token = user.auth.replace("Bearer ", "");
    const tampered = `${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;

    const res = await request(protectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${tampered}`);

    expect(res.status).toBe(401);
  });

  it("rejects an expired token", async () => {
    const user = await createTestUser();
    const token = jwt.sign(
      { tv: 0, exp: Math.floor(Date.now() / 1000) - 60 },
      config.jwtSecret,
      {
        algorithm: JWT_ALGORITHM,
        subject: user.id,
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      },
    );

    const res = await request(protectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it("rejects HS384 and HS512 tokens", async () => {
    const user = await createTestUser();
    for (const algorithm of ["HS384", "HS512"] as const) {
      const token = jwt.sign(
        { tv: 0 },
        config.jwtSecret,
        {
          algorithm,
          expiresIn: "15m",
          subject: user.id,
          issuer: config.jwtIssuer,
          audience: config.jwtAudience,
        },
      );
      const res = await request(protectedApp())
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(401);
    }
  });

  it("rejects alg=none token", async () => {
    const header = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" }),
    ).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({ sub: "00000000-0000-4000-8000-000000000001", tv: 0 }),
    ).toString("base64url");

    const res = await request(protectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${header}.${body}.`);

    expect(res.status).toBe(401);
  });

  it("rejects wrong secret, wrong iss, wrong aud, and nbf in the future", async () => {
    const user = await createTestUser();
    const wrongSecret = jwt.sign(
      { tv: 0 },
      "wrong-secret-wrong-secret-wrong-secret!!",
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: "15m",
        subject: user.id,
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      },
    );
    const wrongIss = jwt.sign({ tv: 0 }, config.jwtSecret, {
      algorithm: JWT_ALGORITHM,
      expiresIn: "15m",
      subject: user.id,
      issuer: "wrong-issuer",
      audience: config.jwtAudience,
    });
    const wrongAud = jwt.sign({ tv: 0 }, config.jwtSecret, {
      algorithm: JWT_ALGORITHM,
      expiresIn: "15m",
      subject: user.id,
      issuer: config.jwtIssuer,
      audience: "wrong-audience",
    });
    const futureNbf = jwt.sign(
      { tv: 0 },
      config.jwtSecret,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: "15m",
        notBefore: "1h",
        subject: user.id,
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      },
    );

    for (const token of [wrongSecret, wrongIss, wrongAud, futureNbf]) {
      const res = await request(protectedApp())
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(401);
    }
  });

  it("rejects non-UUID sub and missing tv", async () => {
    const missingTv = jwt.sign({}, config.jwtSecret, {
      algorithm: JWT_ALGORITHM,
      expiresIn: "15m",
      subject: "not-a-uuid",
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    });
    const badSub = jwt.sign(
      { tv: 0 },
      config.jwtSecret,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: "15m",
        subject: "user-1",
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      },
    );

    for (const token of [missingTv, badSub]) {
      const res = await request(protectedApp())
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(401);
    }
  });

  it("rejects after logout (token version mismatch) and deleted user", async () => {
    const user = await createTestUser();
    const token = user.auth.replace("Bearer ", "");

    await prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
    });

    const revoked = await request(protectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(revoked.status).toBe(401);

    await prisma.user.delete({ where: { id: user.id } });
    const deleted = await request(protectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(deleted.status).toBe(401);
  });

  it("uses role from the database, not the token", async () => {
    const user = await createTestUser("USER");
    const token = jwt.sign(
      { tv: 0, role: "ADMIN" },
      config.jwtSecret,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: "15m",
        subject: user.id,
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      },
    );

    const res = await request(protectedApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("USER");
  });

  it("attaches the user for a valid token", async () => {
    const user = await createTestUser();
    const res = await request(protectedApp())
      .get("/protected")
      .set("Authorization", user.auth);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  });
});
