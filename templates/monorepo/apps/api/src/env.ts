import * as z from "zod";

const Schema = z.object({
  HOST: z.string().default("localhost"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_PRETTY: z.coerce.boolean().default(true),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export const env = Schema.parse(process.env);
export type Env = z.infer<typeof Schema>;
