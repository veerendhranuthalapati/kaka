import bcrypt from "bcrypt";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UserRepository } from "../../src/repositories/user.repository.js";
import { AuthService } from "../../src/services/auth.service.js";

describe("AuthService.login", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("still runs bcrypt.compare when the email is unknown", async () => {
    const compare = vi.spyOn(bcrypt, "compare");
    const users: UserRepository = {
      create: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
    };
    const service = new AuthService(users);

    await expect(
      service.login({ email: "missing@example.com", password: "password1" }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });

    expect(compare).toHaveBeenCalledTimes(1);
    expect(compare).toHaveBeenCalledWith("password1", expect.any(String));
  });
});
