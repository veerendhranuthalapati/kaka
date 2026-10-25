export function refuseProductionSeed(nodeEnv: string | undefined): void {
  if (nodeEnv === "production") {
    throw new Error("seed:demo refuses to run in production");
  }
}

export function refuseTestDatabase(databaseUrl: string | undefined): void {
  if (!databaseUrl) {
    return;
  }
  const match = databaseUrl.match(/\/([^/?]+)(?:\?|$)/);
  const databaseName = match?.[1] ?? "";
  if (databaseName.endsWith("_test")) {
    throw new Error("seed:demo refuses to run against a _test database");
  }
}
