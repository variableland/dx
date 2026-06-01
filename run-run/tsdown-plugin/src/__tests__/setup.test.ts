import type { PluginContext } from "@rrlab/cli/plugin";
import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import { describe, expect, it } from "vitest";
import tsdown from "../index.ts";

function ctx(): PluginContext {
  return {
    shell: {} as ShellService,
    // biome-ignore lint/suspicious/noExplicitAny: minimal stub
    logger: {} as any,
    appPkg: { dirPath: process.cwd() } as Pkg,
    binPkg: { dirPath: process.cwd() } as Pkg,
    cwd: process.cwd(),
  };
}

describe("@rrlab/tsdown-plugin services()", () => {
  it("returns the pack capability when no `only` is supplied", async () => {
    const caps = await tsdown().services(ctx());
    expect(Object.keys(caps)).toEqual(["pack"]);
  });

  it("returns the pack capability when `only: ['pack']` is supplied", async () => {
    const caps = await tsdown({ only: ["pack"] }).services(ctx());
    expect(Object.keys(caps)).toEqual(["pack"]);
  });

  it("throws when `only` references an unknown capability", async () => {
    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: bypassing the TS guard to exercise the runtime check
      tsdown({ only: ["lint"] as any }).services(ctx()),
    ).rejects.toThrow(/unknown capability 'lint'/);
  });
});
