import type { PluginContext } from "@rrlab/cli/plugin";
import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import { describe, expect, it } from "vitest";
import oxc, { OxlintTypeCheckService } from "../index.ts";

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

describe("@rrlab/oxc-plugin capabilities()", () => {
  it("returns all capabilities (lint, format, tsc) when no `only` is supplied", async () => {
    const caps = await oxc().capabilities(ctx());
    expect(Object.keys(caps).sort()).toEqual(["format", "lint", "tsc"]);
  });

  it("narrows to just `tsc` when `only: ['tsc']` is supplied", async () => {
    const caps = await oxc({ only: ["tsc"] }).capabilities(ctx());
    expect(Object.keys(caps)).toEqual(["tsc"]);
    expect(caps.tsc).toBeInstanceOf(OxlintTypeCheckService);
  });

  it("narrows to lint+format when `only: ['lint', 'format']` is supplied", async () => {
    const caps = await oxc({ only: ["lint", "format"] }).capabilities(ctx());
    expect(Object.keys(caps).sort()).toEqual(["format", "lint"]);
  });

  it("throws when `only` references an unknown capability", async () => {
    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: bypassing the TS guard to exercise the runtime check
      oxc({ only: ["pack"] as any }).capabilities(ctx()),
    ).rejects.toThrow(/unknown capability 'pack'/);
  });
});

describe("OxlintTypeCheckService", () => {
  it("constructs against the oxlint binary", () => {
    const svc = new OxlintTypeCheckService({} as ShellService);
    expect(svc.bin).toBe("oxlint");
  });
});
