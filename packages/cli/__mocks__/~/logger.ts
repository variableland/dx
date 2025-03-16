import type { AnyLogger } from "~/logger";

const StubLogger: AnyLogger = {
  info: () => {},
  error: () => {},
  debug: () => {},
  subdebug: () => () => {},
};

export { StubLogger as Log };
