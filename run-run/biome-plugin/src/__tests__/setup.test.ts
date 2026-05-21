import type { PluginContext } from "@rrlab/cli/plugin";
import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import { describe, expect, it } from "vitest";
import biome from "../index.ts";

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

describe("@rrlab/biome-plugin capabilities()", () => {
  it("returns all capabilities (lint, format, jsc) when no `only` is supplied", async () => {
    const caps = await biome().capabilities(ctx());
    expect(Object.keys(caps).sort()).toEqual(["format", "jsc", "lint"]);
  });

  it("narrows to just lint+format when `only: ['lint', 'format']` is supplied", async () => {
    const caps = await biome({ only: ["lint", "format"] }).capabilities(ctx());
    expect(Object.keys(caps).sort()).toEqual(["format", "lint"]);
    expect(caps.jsc).toBeUndefined();
  });

  it("throws when `only` references an unknown capability", async () => {
    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: bypassing the TS guard to exercise the runtime check
      biome({ only: ["tsc"] as any }).capabilities(ctx()),
    ).rejects.toThrow(/unknown capability 'tsc'/);
  });
});
