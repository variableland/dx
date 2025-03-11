import { Logger } from "~/logger";
import pkg from "../../package.json";

export function getVersion() {
  const d = Logger.subdebug("get-version");

  const version = process.env.VERSION || pkg.version;

  d("resolved version: %s", version);
  d("VERSION in env: %s", process.env.VERSION);

  return version;
}
