import pkg from "../../package.json";
import { Logger } from "../services/logger";

export function getVersion() {
  const debug = Logger.subdebug("get-version");

  const version = process.env.VERSION || pkg.version;

  debug("resolved version: %s", version);

  if (process.env.VERSION) {
    debug("VERSION in env: %s", process.env.VERSION);
  }

  return version;
}
