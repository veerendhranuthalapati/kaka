import bcrypt from "bcrypt";
import type { Role } from "@prisma/client";
import { signAccessToken } from "../../src/services/auth.service.js";
import { prisma } from "../../src/lib/prisma.js";
import { TEST_USER_PASSWORD } from "./passwords.js";

export async function createTestUser(
  role: Role = "USER",
  email: string = `${role.toLowerCase()}-${Date.now()}@example.com`,
): Promise<{ id: string; email: string; role: Role; auth: string }> {
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(TEST_USER_PASSWORD, 4),
      role,
    },
  });

  const token = signAccessToken(user);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    auth: `Bearer ${token}`,
  };
}
