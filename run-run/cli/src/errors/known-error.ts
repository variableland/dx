/**
 * Base class for user-facing domain errors. The top-level handler (`reportError`
 * in `src/program/report-error.ts`) renders a `KnownError` as a clean message —
 * no stack trace — and exits 1. Anything that is NOT a `KnownError` is treated
 * as an unexpected bug and surfaces its full stack so it can be reported.
 *
 * Don't set `this.name` in subclasses — keep the plain `Error:` prefix so output
 * stays clean.
 */
export class KnownError extends Error {}
