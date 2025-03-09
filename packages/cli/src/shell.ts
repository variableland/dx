import { $ as make$ } from "zx";
import { quote } from "./utils/quote";
import { isRaw } from "./utils/is-raw";

export const $ = make$({
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
