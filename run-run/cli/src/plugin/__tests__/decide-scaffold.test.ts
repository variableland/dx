import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import { describe, expect, it, vi } from "vitest";
import { decideScaffold } from "#src/plugin/decide-scaffold.ts";
import type { ClackPrompts, InstallContext } from "#src/plugin/types.ts";

function makeCtx(overrides: { prompts?: ClackPrompts; flags?: Partial<InstallContext["flags"]> } = {}): InstallContext {
  return {
    shell: {} as ShellService,
    // biome-ignore lint/suspicious/noExplicitAny: minimal stub
    logger: {} as any,
    appPkg: { dirPath: process.cwd() } as Pkg,
    prompts: overrides.prompts ?? ({} as ClackPrompts),
    flags: { force: false, yes: false, nonInteractive: false, ...overrides.flags },
    // biome-ignore lint/suspicious/noExplicitAny: ReleaseService is not exercised here
    release: {} as any,
  };
}

describe("decideScaffold", () => {
  describe("unattended (--yes or non-interactive)", () => {
    it("returns 'create' when file does not exist", async () => {
      const decision = await decideScaffold(makeCtx({ flags: { yes: true } }), {
        label: "biome.json",
        fileExists: false,
        patchHint: "x",
      });
      expect(decision).toBe("create");
    });

    it("returns 'patch' when file exists and default unattendedExistingAction", async () => {
      const decision = await decideScaffold(makeCtx({ flags: { yes: true } }), {
        label: "biome.json",
        fileExists: true,
        patchHint: "x",
      });
      expect(decision).toBe("patch");
    });

    it("returns 'skip' when file exists and unattendedExistingAction: 'skip'", async () => {
      const decision = await decideScaffold(makeCtx({ flags: { nonInteractive: true } }), {
        label: "tsdown.config.ts",
        fileExists: true,
        patchHint: "x",
        unattendedExistingAction: "skip",
      });
      expect(decision).toBe("skip");
    });
  });

  describe("interactive", () => {
    it("confirms creation when file does not exist", async () => {
      const confirm = vi.fn().mockResolvedValue(true);
      const ctx = makeCtx({
        prompts: { confirm, select: vi.fn(), isCancel: () => false } as unknown as ClackPrompts,
      });
      const decision = await decideScaffold(ctx, { label: "biome.json", fileExists: false, patchHint: "x" });
      expect(decision).toBe("create");
      expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("biome.json") }));
    });

    it("returns 'skip' when user declines the create confirm", async () => {
      const ctx = makeCtx({
        prompts: {
          confirm: vi.fn().mockResolvedValue(false),
          select: vi.fn(),
          isCancel: () => false,
        } as unknown as ClackPrompts,
      });
      const decision = await decideScaffold(ctx, { label: "biome.json", fileExists: false, patchHint: "x" });
      expect(decision).toBe("skip");
    });

    it("shows the patch/skip/overwrite select when file exists", async () => {
      const select = vi.fn().mockResolvedValue("overwrite");
      const ctx = makeCtx({
        prompts: { confirm: vi.fn(), select, isCancel: () => false } as unknown as ClackPrompts,
      });
      const decision = await decideScaffold(ctx, {
        label: "biome.json",
        fileExists: true,
        patchHint: "add @rrlab/biome-config to extends",
      });
      expect(decision).toBe("overwrite");
      const call = select.mock.calls[0]?.[0] as { options: Array<{ value: string; label: string }> };
      expect(call.options.map((o) => o.value).sort()).toEqual(["overwrite", "patch", "skip"]);
      expect(call.options.find((o) => o.value === "patch")?.label).toMatch(/add @rrlab\/biome-config to extends/);
    });

    it("throws 'Cancelled by user.' when the user cancels", async () => {
      const cancelSymbol = Symbol("cancel");
      const ctx = makeCtx({
        prompts: {
          confirm: vi.fn().mockResolvedValue(cancelSymbol),
          select: vi.fn(),
          isCancel: (v: unknown) => v === cancelSymbol,
        } as unknown as ClackPrompts,
      });
      await expect(decideScaffold(ctx, { label: "x", fileExists: false, patchHint: "y" })).rejects.toThrow("Cancelled by user.");
    });
  });
});
