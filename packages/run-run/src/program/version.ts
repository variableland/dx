import pkg from "../../package.json";
import { console } from "../services/console";

export function getVersion() {
  const debug = console.subdebug("get-version");

  const version = Bun.env.VERSION || pkg.version;

  debug("resolved version:", version);

  if (Bun.env.VERSION) {
    debug("VERSION in env:", Bun.env.VERSION);
  }

  return version;
}
