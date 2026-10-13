import { KnownError } from "#src/errors/known-error.ts";
import { logger } from "#src/services/logger.ts";

/**
 * Renders a fatal error at the program boundary. A `KnownError` is a user-facing
 * domain error (missing plugin, bad config, …) — print just its message so the
 * guidance it carries lands without a wall of stack frames. Anything else is an
 * unexpected bug: surface the full stack so it can be reported.
 *
 * Only renders; the caller sets `process.exitCode`.
 */
export function reportError(error: unknown): void {
  if (error instanceof KnownError) {
    logger.error(error.message);
    return;
  }

  logger.error(error instanceof Error ? (error.stack ?? error.message) : error);
}
