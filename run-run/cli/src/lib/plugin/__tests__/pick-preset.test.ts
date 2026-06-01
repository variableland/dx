import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import { describe, expect, it, vi } from "vitest";
import { pickPreset } from "#src/lib/plugin/pick-preset.ts";
import type { ClackPrompts, InstallContext } from "#src/lib/plugin/types.ts";

function makeCtx(overrides: { prompts?: ClackPrompts; flags?: Partial<InstallContext["flags"]> } = {}): InstallContext {
  return {
    shell: {} as ShellService,
    // biome-ignore lint/suspicious/noExplicitAny: minimal stub
    logger: {} as any,
    appPkg: { dirPath: process.cwd() } as Pkg,
    prompts: overrides.prompts ?? ({} as ClackPrompts),
    flags: { force: false, yes: false, nonInteractive: false, ...overrides.flags },
    // biome-ignore lint/suspicious/noExplicitAny: ReleaseService not exercised here
    release: {} as any,
  };
}

const PRESETS = {
  lib: { label: "Library" },
  bin: { label: "CLI / Node binary" },
};

describe("pickPreset", () => {
  it("returns the defaultPreset under --yes", async () => {
    const choice = await pickPreset(makeCtx({ flags: { yes: true } }), {
      message: "Which kind of build?",
      presets: PRESETS,
      defaultPreset: "lib",
    });
    expect(choice).toBe("lib");
  });

  it("returns the defaultPreset under non-interactive", async () => {
    const choice = await pickPreset(makeCtx({ flags: { nonInteractive: true } }), {
      message: "x",
      presets: PRESETS,
      defaultPreset: "bin",
    });
    expect(choice).toBe("bin");
  });

  it("returns the user's interactive choice", async () => {
    const select = vi.fn().mockResolvedValue("bin");
    const ctx = makeCtx({
      prompts: { confirm: vi.fn(), select, isCancel: () => false } as unknown as ClackPrompts,
    });
    const choice = await pickPreset(ctx, {
      message: "Which kind of build?",
      presets: PRESETS,
      defaultPreset: "lib",
    });
    expect(choice).toBe("bin");
    const call = select.mock.calls[0]?.[0] as { options: Array<{ value: string; label: string }> };
    expect(call.options).toEqual([
      { value: "lib", label: "Library" },
      { value: "bin", label: "CLI / Node binary" },
    ]);
  });

  it("throws 'Cancelled by user.' when the user cancels", async () => {
    const cancelSymbol = Symbol("cancel");
    const ctx = makeCtx({
      prompts: {
        confirm: vi.fn(),
        select: vi.fn().mockResolvedValue(cancelSymbol),
        isCancel: (v: unknown) => v === cancelSymbol,
      } as unknown as ClackPrompts,
    });
    await expect(pickPreset(ctx, { message: "x", presets: PRESETS, defaultPreset: "lib" })).rejects.toThrow("Cancelled by user.");
  });
});
