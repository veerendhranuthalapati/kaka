import { apiRequest } from "./client";

export type DemoSeedResult = {
  created: number;
  updated: number;
  skipped: number;
};

export async function loadDemoVehicles(
  signal?: AbortSignal,
): Promise<DemoSeedResult> {
  return apiRequest<DemoSeedResult>("/api/admin/demo-vehicles", {
    method: "POST",
    body: {},
    signal,
  });
}

export const DEMO_VEHICLES_DISABLED_MESSAGE =
  "Sample data loading is disabled on this server. Set DEMO_DATA_ENDPOINT_ENABLED=true to allow it.";
