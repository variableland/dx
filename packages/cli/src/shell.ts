import { $ as make$ } from "zx";
import { isRaw } from "./utils/is-raw";
import { quote } from "./utils/quote";

export const $ = make$({
  cwd: process.env.RR_PWD ?? process.cwd(),
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
