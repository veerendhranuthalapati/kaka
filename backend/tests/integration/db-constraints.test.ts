import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { prisma } from "../../src/lib/prisma.js";

describe("vehicle CHECK constraints", () => {
  it("rejects negative quantity via raw insert", async () => {
    const id = randomUUID();
    await expect(
      prisma.$executeRaw`
        INSERT INTO "Vehicle" (id, make, model, category, price, quantity)
        VALUES (${id}::uuid, 'Bad', 'Qty', 'Sedan', 1000, -1)
      `,
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });

  it("rejects features array longer than 12", async () => {
    const id = randomUUID();
    const features = Array.from({ length: 13 }, (_, i) => `feature-${i}`);
    await expect(
      prisma.$executeRaw`
        INSERT INTO "Vehicle" (id, make, model, category, price, quantity, features)
        VALUES (${id}::uuid, 'Bad', 'Feat', 'Sedan', 1000, 1, ${features}::text[])
      `,
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });
});
