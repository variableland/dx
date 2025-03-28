import { Log } from "@variableland/console";
import pkg from "../../package.json";

export function getVersion() {
  const d = Log.subdebug("get-version");

  const version = process.env.VERSION || pkg.version;

  d("resolved version: %s", version);
  d("VERSION in env: %s", process.env.VERSION);

  return version;
}
