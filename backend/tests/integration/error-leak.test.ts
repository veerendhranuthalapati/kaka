import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "../../src/middleware/errorHandler.js";

describe("error handler leak prevention", () => {
  it("does not echo paths, SQL, or connection strings in 500 responses", async () => {
    const app = express();
    app.get("/boom", () => {
      throw new Error(
        'ENOENT: C:\\secrets\\app\\db.conf SELECT * FROM "User" WHERE password postgres://user:pass@localhost:5432/db',
      );
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom");
    expect(res.status).toBe(500);
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/\/secret\/path/);
    expect(body).not.toMatch(/SELECT \*/i);
    expect(body).not.toMatch(/postgres:\/\//);
    expect(res.body.error).toMatchObject({ code: "INTERNAL_ERROR" });
  });
});
