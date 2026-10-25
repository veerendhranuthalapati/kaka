import { Prisma, type Vehicle } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { OptionalVehicleSpecFields } from "../validators/vehicle.specs.schema.js";

/** Escape `\`, `%`, and `_` for use in ILIKE ... ESCAPE '\\' patterns. */
export function escapeIlikeContainsPattern(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

const VEHICLE_SELECT_COLUMNS = Prisma.sql`
  id, make, model, category, price, quantity, "imageUrl",
  year, "odometerKm", "engineCc", "powerBhp", "torqueNm",
  "fuelType", transmission, drivetrain, "fuelEconomyKmpl",
  color, owners, vin, seats, "rangeKm", "batteryKwh", description, features,
  "createdAt", "updatedAt"
`;

export type CreateVehicleInput = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
} & OptionalVehicleSpecFields;

export type VehicleSearchFilters = {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  minYear?: number;
  maxOdometerKm?: number;
};

export type UpdateVehicleInput = Partial<
  Pick<Vehicle, "make" | "model" | "category" | "imageUrl"> & { price: number }
> &
  OptionalVehicleSpecFields;

export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  search(filters: VehicleSearchFilters): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  findByMakeAndModel(make: string, model: string): Promise<Vehicle | null>;
  update(id: string, data: UpdateVehicleInput): Promise<Vehicle>;
  delete(id: string): Promise<Vehicle>;
  purchase(id: string): Promise<{ count: number }>;
  restock(id: string, amount: number): Promise<Vehicle>;
  runDemoSeedTransaction<T>(
    fn: (repo: VehicleRepository) => Promise<T>,
  ): Promise<T>;
}

function toPrismaCreateData(
  data: CreateVehicleInput,
): Prisma.VehicleCreateInput {
  const { fuelEconomyKmpl, batteryKwh, features, ...rest } = data;
  return {
    ...rest,
    features: features ?? [],
    ...(fuelEconomyKmpl === undefined
      ? {}
      : { fuelEconomyKmpl: fuelEconomyKmpl ?? null }),
    ...(batteryKwh === undefined
      ? {}
      : { batteryKwh: batteryKwh ?? null }),
  };
}

function toPrismaUpdateData(
  data: UpdateVehicleInput,
): Prisma.VehicleUpdateInput {
  const { fuelEconomyKmpl, batteryKwh, features, ...rest } = data;
  return {
    ...rest,
    ...(features === undefined ? {} : { features }),
    ...(fuelEconomyKmpl === undefined
      ? {}
      : { fuelEconomyKmpl: fuelEconomyKmpl ?? null }),
    ...(batteryKwh === undefined
      ? {}
      : { batteryKwh: batteryKwh ?? null }),
  };
}

export class PrismaVehicleRepository implements VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data: toPrismaCreateData(data) });
  }

  findAll(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });
  }

  findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  findByMakeAndModel(make: string, model: string): Promise<Vehicle | null> {
    return prisma.vehicle.findFirst({ where: { make, model } });
  }

  runDemoSeedTransaction<T>(
    fn: (repo: VehicleRepository) => Promise<T>,
  ): Promise<T> {
    return prisma.$transaction(async (tx) => {
      const txRepo: VehicleRepository = {
        create: (data) => tx.vehicle.create({ data: toPrismaCreateData(data) }),
        findAll: () => tx.vehicle.findMany({ orderBy: { createdAt: "asc" } }),
        search: (filters) => this.search(filters),
        findById: (id) => tx.vehicle.findUnique({ where: { id } }),
        findByMakeAndModel: (make, model) =>
          tx.vehicle.findFirst({ where: { make, model } }),
        update: (id, data) =>
          tx.vehicle.update({ where: { id }, data: toPrismaUpdateData(data) }),
        delete: (id) => tx.vehicle.delete({ where: { id } }),
        purchase: async (id) => {
          const result = await tx.vehicle.updateMany({
            where: { id, quantity: { gt: 0 } },
            data: { quantity: { decrement: 1 } },
          });
          return { count: result.count };
        },
        restock: (id, amount) =>
          tx.vehicle.update({
            where: { id },
            data: { quantity: { increment: amount } },
          }),
        runDemoSeedTransaction: (inner) => inner(txRepo),
      };
      return fn(txRepo);
    });
  }

  update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data: toPrismaUpdateData(data),
    });
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
    if (filters.fuelType !== undefined) {
      conditions.push(Prisma.sql`"fuelType" = ${filters.fuelType}`);
    }
    if (filters.minYear !== undefined) {
      conditions.push(Prisma.sql`year >= ${filters.minYear}`);
    }
    if (filters.maxOdometerKm !== undefined) {
      conditions.push(Prisma.sql`"odometerKm" <= ${filters.maxOdometerKm}`);
    }

    const whereClause =
      conditions.length === 0
        ? Prisma.sql`TRUE`
        : Prisma.join(conditions, " AND ");

    return prisma.$queryRaw<Vehicle[]>`
      SELECT ${VEHICLE_SELECT_COLUMNS}
      FROM "Vehicle"
      WHERE ${whereClause}
      ORDER BY "createdAt" ASC
    `;
  }
}
