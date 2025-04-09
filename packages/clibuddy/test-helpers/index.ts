import { mock } from "bun:test";
import * as zx from "zx";
import { isRaw } from "../src";

mock.module("zx", () => {
  const $$ = mock(function fakeShell(strs: string[], ...args: string[]) {
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

  const $ = mock(function make$() {
    return $$;
  });

  return {
    ...zx,
    $,
  };
});
