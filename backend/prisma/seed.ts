import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { config } from "../src/config/env.js";
import { validatePasswordPolicy } from "../src/security/passwordPolicy.js";
import { normalizeEmail } from "../src/validators/normalizeEmail.js";

const prisma = new PrismaClient();

async function main() {
  const rawEmail = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!rawEmail || !password) {
    return;
  }

  const email = normalizeEmail(rawEmail);
  const policyError = validatePasswordPolicy(password, {
    email,
    requireAdminStrength: true,
  });
  if (policyError) {
    throw new Error(`ADMIN_PASSWORD policy: ${policyError}`);
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptCost);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
      passwordHash,
    },
    create: {
      email,
      passwordHash,
      role: Role.ADMIN,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
