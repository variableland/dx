import type { PluginContext } from "@rrlab/cli/plugin";
import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import { describe, expect, it } from "vitest";
import ts from "../index.ts";

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

describe("@rrlab/ts-plugin capabilities()", () => {
  it("returns the tsc capability when no `only` is supplied", async () => {
    const caps = await ts().capabilities(ctx());
    expect(Object.keys(caps)).toEqual(["tsc"]);
  });

  it("returns the tsc capability when `only: ['tsc']` is supplied", async () => {
    const caps = await ts({ only: ["tsc"] }).capabilities(ctx());
    expect(Object.keys(caps)).toEqual(["tsc"]);
  });

  it("throws when `only` references an unknown capability", async () => {
    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: bypassing the TS guard to exercise the runtime check
      ts({ only: ["lint"] as any }).capabilities(ctx()),
    ).rejects.toThrow(/unknown capability 'lint'/);
  });
});
