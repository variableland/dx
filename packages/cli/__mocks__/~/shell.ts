import { vi } from "vitest";

export const $ = vi.fn(function fakeShell(strs: string[], ...args: any) {
  let output = "";
  let argsIndex = 0;

  const stringifyArg = (arg: any) => (typeof arg.stdout === "string" ? arg.stdout : arg);

  strs.forEach((str) => {
    if (str === "") {
      if (args[argsIndex]) {
        output += stringifyArg(args[argsIndex]);
        argsIndex += 1;
      }
    } else {
      output += str;
    }
  });

  return output;
});
