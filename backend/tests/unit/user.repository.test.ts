import { Prisma } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../src/lib/prisma.js";
import { PrismaUserRepository } from "../../src/repositories/user.repository.js";

describe("PrismaUserRepository.create", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps unique email violations to EMAIL_TAKEN", async () => {
    const repo = new PrismaUserRepository();
    const err = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
      meta: { target: ["email"] },
    });
    vi.spyOn(prisma.user, "create").mockRejectedValueOnce(err);

    await expect(
      repo.create({
        email: "taken@example.com",
        passwordHash: "hash",
        role: "USER",
      }),
    ).rejects.toMatchObject({ status: 409, code: "EMAIL_TAKEN" });
  });

  it("maps other unique violations to CONFLICT", async () => {
    const repo = new PrismaUserRepository();
    const err = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
      meta: { target: ["id"] },
    });
    vi.spyOn(prisma.user, "create").mockRejectedValueOnce(err);

    await expect(
      repo.create({
        email: "new@example.com",
        passwordHash: "hash",
        role: "USER",
      }),
    ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });
  });
});
