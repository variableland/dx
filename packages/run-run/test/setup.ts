import { mock } from "bun:test";
import * as clibuddy from "@variableland/clibuddy";

// required to look the cli package.json up
Bun.env.BIN_PATH = ".";
// required to make the version command work independently of the package.json version
Bun.env.VERSION = "0.0.0-test";

mock.module("is-ci", () => ({ default: false }));

mock.module("@variableland/clibuddy", async () => {
  const $ = mock(function fakeShell(strs: string[], ...args: string[]) {
    let output = "";
    let argsIndex = 0;

    const stringifyArg = (arg: unknown) => (clibuddy.isRaw(arg) ? arg.stdout : arg);

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

  return {
    ...clibuddy,
    $,
  };
});
