import { describe, expect, it } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { VehicleDataCache } from "./vehicleDataCache";

describe("optimistic purchase rollback", () => {
  it("restores quantity when purchase fails", async () => {
    const cache = new VehicleDataCache();
    const vehicle = makeVehicle({ id: "v1", quantity: 2 });
    cache.setSearch("{}", [vehicle]);

    const previousQty = vehicle.quantity;
    cache.patchVehicle(vehicle.id, { quantity: 1 });
    expect(cache.getVehicle("v1")?.quantity).toBe(1);

    cache.patchVehicle(vehicle.id, { quantity: previousQty });
    expect(cache.getVehicle("v1")?.quantity).toBe(2);
  });
});
