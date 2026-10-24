import { describe, expect, it } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { selectFeaturedVehicles } from "./featuredVehicles";

describe("selectFeaturedVehicles", () => {
  it("returns only in-stock vehicles sorted newest first with a max of six", () => {
    const vehicles = [
      makeVehicle({ id: "1", quantity: 0, createdAt: "2026-01-01T00:00:00.000Z" }),
      makeVehicle({ id: "2", quantity: 2, createdAt: "2026-01-03T00:00:00.000Z" }),
      makeVehicle({ id: "3", quantity: 1, createdAt: "2026-01-02T00:00:00.000Z" }),
      makeVehicle({ id: "4", quantity: 1, createdAt: "2026-01-04T00:00:00.000Z" }),
      makeVehicle({ id: "5", quantity: 1, createdAt: "2026-01-05T00:00:00.000Z" }),
      makeVehicle({ id: "6", quantity: 1, createdAt: "2026-01-06T00:00:00.000Z" }),
      makeVehicle({ id: "7", quantity: 1, createdAt: "2026-01-07T00:00:00.000Z" }),
      makeVehicle({ id: "8", quantity: 1, createdAt: "2026-01-08T00:00:00.000Z" }),
    ];

    const featured = selectFeaturedVehicles(vehicles);

    expect(featured.map((vehicle) => vehicle.id)).toEqual([
      "8",
      "7",
      "6",
      "5",
      "4",
      "2",
    ]);
  });

  it("returns an empty list when nothing is in stock", () => {
    expect(
      selectFeaturedVehicles([
        makeVehicle({ quantity: 0 }),
        makeVehicle({ quantity: 0 }),
      ]),
    ).toEqual([]);
  });
});
