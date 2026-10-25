import { z } from "zod";

export const adminDemoSeedBodySchema = z.preprocess(
  (value) => (value === undefined ? {} : value),
  z.object({}).strict(),
);
