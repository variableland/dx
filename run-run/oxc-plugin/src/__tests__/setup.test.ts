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

describe("@rrlab/oxc-plugin services()", () => {
  it("returns all capabilities (lint, format, typecheck) when no `only` is supplied", async () => {
    const caps = await oxc().services(ctx());
    expect(Object.keys(caps).sort()).toEqual(["format", "lint", "typecheck"]);
  });

  it("narrows to just `typecheck` when `only: ['typecheck']` is supplied", async () => {
    const caps = await oxc({ only: ["typecheck"] }).services(ctx());
    expect(Object.keys(caps)).toEqual(["typecheck"]);
    expect(caps.typecheck).toBeInstanceOf(OxlintTypeCheckService);
  });

  it("narrows to lint+format when `only: ['lint', 'format']` is supplied", async () => {
    const caps = await oxc({ only: ["lint", "format"] }).services(ctx());
    expect(Object.keys(caps).sort()).toEqual(["format", "lint"]);
  });

  it("throws when `only` references an unknown capability", async () => {
    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: bypassing the TS guard to exercise the runtime check
      oxc({ only: ["pack"] as any }).services(ctx()),
    ).rejects.toThrow(/unknown capability 'pack'/);
  });
});

describe("OxlintTypeCheckService", () => {
  it("constructs against the oxlint tool", () => {
    const svc = new OxlintTypeCheckService({} as ShellService);
    expect(svc.pkg).toBe("oxlint");
  });
});
