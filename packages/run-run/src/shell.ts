import { $ as make$ } from "zx";
import { cwd } from "./utils/cwd";
import { isRaw } from "./utils/is-raw";
import { quote } from "./utils/quote";

export const $ = make$({
  cwd,
  verbose: true,
  quote: (arg: unknown) => {
    if (typeof arg === "string") {
      return quote(arg);
    }

    if (isRaw(arg)) {
      return arg.stdout;
    }

    throw TypeError(`Unsupported argument type: ${typeof arg}`);
  },
});
