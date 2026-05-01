import { vi } from "vitest";
import { isRaw } from "../src/index.ts";

vi.mock("zx", async (importOriginal) => {
  const originalZx = await importOriginal<typeof import("zx")>();

  const $$ = vi.fn(function fakeShell(strs: TemplateStringsArray, ...args: unknown[]) {
    let output = "";
    let argsIndex = 0;

    const stringifyArg = (arg: unknown) => (isRaw(arg) ? (arg as { stdout: string }).stdout : arg);

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

  const $ = vi.fn(function make$() {
    return $$;
  });

  return {
    ...originalZx,
    $,
  };
});
