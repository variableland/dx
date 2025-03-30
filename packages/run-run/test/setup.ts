import { beforeEach, vi } from "vitest";

vi.mock("is-ci", () => ({ default: false }));

vi.mock("@variableland/clibuddy", async (importActual) => {
  const actual = await importActual<typeof import("@variableland/clibuddy")>();

  const $ = vi.fn(function fakeShell(strs: string[], ...args: string[]) {
    let output = "";
    let argsIndex = 0;

    const stringifyArg = (arg: unknown) => (actual.isRaw(arg) ? arg.stdout : arg);

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
    ...actual,
    $,
  };
});

vi.mock("@variableland/console", async (importActual) => {
  const actual = await importActual<typeof import("@variableland/console")>();

  return {
    ...actual,
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      subdebug: vi.fn(() => vi.fn()),
    })),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});
