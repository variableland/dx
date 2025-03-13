import type { AnyLogger } from "~/logger";

const StubLogger: AnyLogger = {
  info: () => {},
  debug: () => {},
  subdebug: () => () => {},
};

export { StubLogger as Log };
