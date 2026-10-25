import bcrypt from "bcrypt";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UserRepository } from "../../src/repositories/user.repository.js";
import { AuthService } from "../../src/services/auth.service.js";
import { TEST_USER_PASSWORD } from "../helpers/passwords.js";

function stubUsers(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    create: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(null),
    findById: vi.fn(),
    incrementTokenVersion: vi.fn(),
    ...overrides,
  };
}

describe("AuthService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("still runs bcrypt.compare when the email is unknown", async () => {
    const compare = vi.spyOn(bcrypt, "compare");
    const service = new AuthService(stubUsers());

    await expect(
      service.login({
        email: "missing@example.com",
        password: TEST_USER_PASSWORD,
      }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });

    expect(compare).toHaveBeenCalledTimes(1);
    expect(compare).toHaveBeenCalledWith(
      TEST_USER_PASSWORD,
      expect.any(String),
    );
  });

  it("hashes the password before checking whether the email exists on register", async () => {
    const hash = vi.spyOn(bcrypt, "hash");
    const findByEmail = vi.fn().mockResolvedValue({
      id: "existing",
      email: "taken@example.com",
      passwordHash: "x",
      role: "USER",
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const service = new AuthService(stubUsers({ findByEmail }));

    await expect(
      service.register({
        email: "taken@example.com",
        password: TEST_USER_PASSWORD,
      }),
    ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });

    expect(hash).toHaveBeenCalledBefore(findByEmail);
    expect(hash).toHaveBeenCalledTimes(1);
  });
});
