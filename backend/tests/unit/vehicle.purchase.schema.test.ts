import { describe, expect, it } from "vitest";
import { purchaseVehicleBodySchema } from "../../src/validators/vehicle.purchase.schema.js";

describe("purchaseVehicleBodySchema", () => {
  it("accepts an empty strict body", () => {
    expect(purchaseVehicleBodySchema.parse({})).toEqual({});
  });

  it("rejects unknown keys", () => {
    expect(() => purchaseVehicleBodySchema.parse({ amount: 1 })).toThrow();
  });
});
