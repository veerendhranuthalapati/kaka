import { Prisma, type Vehicle } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

/** Escape `\`, `%`, and `_` for use in ILIKE ... ESCAPE '\\' patterns. */
export function escapeIlikeContainsPattern(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

export type CreateVehicleInput = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

export type VehicleSearchFilters = {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type UpdateVehicleInput = Partial<
  Pick<Vehicle, "make" | "model" | "category" | "imageUrl"> & { price: number }
>;

export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  search(filters: VehicleSearchFilters): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  update(id: string, data: UpdateVehicleInput): Promise<Vehicle>;
  delete(id: string): Promise<Vehicle>;
  purchase(id: string): Promise<{ count: number }>;
  restock(id: string, amount: number): Promise<Vehicle>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  }

  findAll(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });
  }

  findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.update({ where: { id }, data });
  }

  delete(id: string): Promise<Vehicle> {
    return prisma.vehicle.delete({ where: { id } });
  }

  async purchase(id: string): Promise<{ count: number }> {
    const result = await prisma.vehicle.updateMany({
      where: { id, quantity: { gt: 0 } },
      data: { quantity: { decrement: 1 } },
    });
    return { count: result.count };
  }

  restock(id: string, amount: number): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data: { quantity: { increment: amount } },
    });
  }

  async search(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    const conditions: Prisma.Sql[] = [];

    if (filters.make !== undefined) {
      const pattern = `%${escapeIlikeContainsPattern(filters.make)}%`;
      conditions.push(Prisma.sql`make ILIKE ${pattern} ESCAPE '\\'`);
    }
    if (filters.model !== undefined) {
      const pattern = `%${escapeIlikeContainsPattern(filters.model)}%`;
      conditions.push(Prisma.sql`model ILIKE ${pattern} ESCAPE '\\'`);
    }
    if (filters.category !== undefined) {
      conditions.push(
        Prisma.sql`LOWER(category) = LOWER(${filters.category})`,
      );
    }
    if (filters.minPrice !== undefined) {
      conditions.push(Prisma.sql`price >= ${filters.minPrice}`);
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(Prisma.sql`price <= ${filters.maxPrice}`);
    }

    const whereClause =
      conditions.length === 0
        ? Prisma.sql`TRUE`
        : Prisma.join(conditions, " AND ");

    return prisma.$queryRaw<Vehicle[]>`
      SELECT id, make, model, category, price, quantity, "imageUrl", "createdAt", "updatedAt"
      FROM "Vehicle"
      WHERE ${whereClause}
      ORDER BY "createdAt" ASC
    `;
  }
}
