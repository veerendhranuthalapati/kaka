import "dotenv/config";
import { performance } from "node:perf_hooks";

const base = `http://localhost:${process.env.PORT ?? "3000"}`;

async function login(): Promise<string> {
  const email = process.env.ADMIN_EMAIL ?? "admin@autoyard.local";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD required in backend/.env");
  }
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`login failed: ${response.status}`);
  }
  const body = (await response.json()) as { token: string };
  return body.token;
}

function percentile(sorted: number[], p: number): number {
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)]!;
}

async function measure(
  label: string,
  url: string,
  token: string,
  method = "GET",
): Promise<{ label: string; p50: number; p95: number }> {
  const samples: number[] = [];
  for (let i = 0; i < 200; i += 1) {
    const start = performance.now();
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    await response.arrayBuffer();
    if (!response.ok && response.status !== 409) {
      throw new Error(`${label} failed: ${response.status}`);
    }
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return { label, p50: percentile(samples, 50), p95: percentile(samples, 95) };
}

async function main(): Promise<void> {
  const token = await login();
  const list = await measure("GET /api/vehicles", `${base}/api/vehicles`, token);
  const search = await measure(
    "GET /api/vehicles/search",
    `${base}/api/vehicles/search`,
    token,
  );
  const vehicles = (await (
    await fetch(`${base}/api/vehicles`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json()) as { id: string; quantity: number }[];
  const vehicleId = vehicles[0]?.id;
  if (!vehicleId) {
    throw new Error("no vehicles for GET one benchmark");
  }
  const one = await measure(
    "GET /api/vehicles/:id",
    `${base}/api/vehicles/${vehicleId}`,
    token,
  );
  const purchasable = vehicles.find((v) => v.quantity > 0) ?? vehicles[0];
  const purchase = await measure(
    "POST /api/vehicles/:id/purchase",
    `${base}/api/vehicles/${purchasable.id}/purchase`,
    token,
    "POST",
  );
  console.log(JSON.stringify({ list, search, one, purchase }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
