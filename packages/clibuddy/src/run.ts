import { isProcessOutput } from "./services/shell/utils";

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
    if (!isProcessOutput(error)) {
      logger.error(formatError(error));
    }
    process.exit(1);
  }
}
