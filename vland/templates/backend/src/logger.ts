import { initLogger } from "evlog";
import { env } from "./env.ts";

initLogger({
  env: { service: "{{projectName}}" },
  minLevel: env.LOG_LEVEL,
  pretty: env.LOG_PRETTY,
});
