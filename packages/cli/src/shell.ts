import { $ as make$ } from "zx";
import { quote } from "./utils/quote";

export const $ = make$({
  verbose: true,
  quote: (arg: any) => (typeof arg.stdout !== "undefined" ? arg.stdout : quote(arg)),
});
