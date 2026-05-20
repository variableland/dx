import "./logger.ts";
import { log } from "evlog";
import { env } from "./env.ts";
import { createApp } from "./server.ts";

const app = createApp();

app.listen({ hostname: env.HOST, port: env.PORT }, ({ hostname, port }) => {
  log.info({ event: "server.started", hostname, port });
});

const SHUTDOWN_TIMEOUT_MS = 8_000;
let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;

  const force = setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS);
  force.unref();

  log.info({ event: "server.stopping", signal });
  try {
    await app.stop();
  } catch (error) {
    log.error({ event: "server.stop_failed", error: String(error) });
  }
  process.exit(signal === "SIGINT" ? 130 : 0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
