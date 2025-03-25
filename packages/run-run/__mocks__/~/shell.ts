import { vi } from "vitest";
import { isRaw } from "../../src/utils/is-raw";

export const $ = vi.fn(function fakeShell(strs: string[], ...args: string[]) {
  let output = "";
  let argsIndex = 0;

  const stringifyArg = (arg: unknown) => (isRaw(arg) ? arg.stdout : arg);

  for (const str of strs) {
    if (str === "") {
      if (args[argsIndex]) {
        output += stringifyArg(args[argsIndex]);
        argsIndex += 1;
      }
    } else {
      output += str;
    }
  }

  return output;
});
