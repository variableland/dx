// @ts-expect-error type defs not found
import createDebug from "debug";

type DebugFn = (message: string, ...args: unknown[]) => void;

const ROOT_DEBUG_LABEL = "run-run";
const rootDebug = createDebug(`${ROOT_DEBUG_LABEL}:cli`);

export const Logger = {
  ...console,
  debug: (message: string, ...args: unknown[]) => {
    rootDebug(message, ...args);
  },
  subdebug: (label: string): DebugFn => createDebug(`${ROOT_DEBUG_LABEL}:${label}`),
};
