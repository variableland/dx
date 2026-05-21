import { HealthSchema } from "@{{projectName}}/types";
import { Elysia } from "elysia";

export const health = new Elysia().get("/health", () => HealthSchema.parse({ ok: true, uptime: process.uptime() }));
