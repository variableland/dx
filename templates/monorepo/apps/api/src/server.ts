import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { health } from "./routes/health.ts";

export function createApp() {
  return new Elysia({ adapter: node() }).use(evlog()).use(health);
}
