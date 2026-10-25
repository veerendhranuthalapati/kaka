import express from "express";
import { Prisma } from "@prisma/client";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { ApiError } from "../../src/errors/ApiError.js";
import { errorHandler } from "../../src/middleware/errorHandler.js";

function appWith(handler: () => void): express.Express {
  const app = express();
  app.get("/boom", handler);
  app.use(errorHandler);
  return app;
}

describe("errorHandler branches", () => {
  it("maps ApiError with details", async () => {
    const app = appWith(() => {
      throw new ApiError(400, "VALIDATION_ERROR", "Bad input", {
        field: "x",
      });
    });
    const res = await request(app).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual({ field: "x" });
  });

  it("maps entity.too.large to 413", async () => {
    const app = appWith(() => {
      throw Object.assign(new Error("too big"), { type: "entity.too.large" });
    });
    const res = await request(app).get("/boom");
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("maps Prisma P2002 on non-email fields to CONFLICT", async () => {
    const app = appWith(() => {
      throw new Prisma.PrismaClientKnownRequestError("conflict", {
        code: "P2002",
        clientVersion: "5",
        meta: { target: ["vin"] },
      });
    });
    const res = await request(app).get("/boom");
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });
});
