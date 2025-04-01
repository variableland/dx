import pkg from "../../package.json";
import { console } from "../services/console";

export function getVersion() {
  const debug = console.subdebug("get-version");

  const version = process.env.VERSION || pkg.version;

  debug("resolved version: %s", version);

  if (process.env.VERSION) {
    debug("VERSION in env: %s", process.env.VERSION);
  }

  return version;
}
