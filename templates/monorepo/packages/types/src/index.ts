import * as z from "zod";

export const HealthSchema = z.object({
  ok: z.boolean(),
  uptime: z.number().nonnegative().optional(),
});

export type Health = z.infer<typeof HealthSchema>;
