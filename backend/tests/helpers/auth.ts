import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { prisma } from "../../src/lib/prisma.js";

const TEST_PASSWORD = "password1";

export async function createTestUser(
  role: Role = "USER",
  email: string = `${role.toLowerCase()}-${Date.now()}@example.com`,
): Promise<{ id: string; email: string; role: Role; auth: string }> {
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 4),
      role,
    },
  });

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { algorithm: "HS256", expiresIn: 900 },
  );

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    auth: `Bearer ${token}`,
  };
}
