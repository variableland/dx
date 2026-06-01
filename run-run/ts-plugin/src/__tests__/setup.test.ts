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

describe("@rrlab/ts-plugin services()", () => {
  it("returns the typecheck capability when no `only` is supplied", async () => {
    const caps = await ts().services(ctx());
    expect(Object.keys(caps)).toEqual(["typecheck"]);
  });

  it("returns the typecheck capability when `only: ['typecheck']` is supplied", async () => {
    const caps = await ts({ only: ["typecheck"] }).services(ctx());
    expect(Object.keys(caps)).toEqual(["typecheck"]);
  });

  it("throws when `only` references an unknown capability", async () => {
    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: bypassing the TS guard to exercise the runtime check
      ts({ only: ["lint"] as any }).services(ctx()),
    ).rejects.toThrow(/unknown capability 'lint'/);
  });
});
