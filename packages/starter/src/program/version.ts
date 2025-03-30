import pkg from "../../package.json";
import { Logger } from "../services/logger";

export function getVersion() {
  const d = Logger.subdebug("get-version");

  const version = process.env.VERSION || pkg.version;

  d("resolved version: %s", version);

  if (process.env.VERSION) {
    d("VERSION in env: %s", process.env.VERSION);
  }

  return version;
}
