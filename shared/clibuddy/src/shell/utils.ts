import { NonZeroExitError } from "tinyexec";

export { NonZeroExitError };

export function isNonZeroExitError(value: unknown): value is NonZeroExitError {
  return value instanceof NonZeroExitError;
}
