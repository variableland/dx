import { isNonZeroExitError } from "./shell/utils.ts";

function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

function formatError(error: unknown): string {
  if (hasMessage(error)) return error.message;
  return String(error);
}

export async function run(fn: () => Promise<void>, logger: { error: (...args: unknown[]) => void }) {
  try {
    await fn();
  } catch (error) {
    // The subprocess already streamed its own stderr; don't double-print.
    if (!isNonZeroExitError(error)) {
      logger.error(formatError(error));
    }
    process.exit(1);
  }
}
