import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ClackPrompts, InstallContext, UninstallContext } from "@rrlab/cli/plugin";
import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { install, uninstall } from "../index.ts";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "rr-tsdown-plugin-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

function installCtx(overrides: Partial<InstallContext> = {}): InstallContext {
  return {
    shell: {} as ShellService,
    // biome-ignore lint/suspicious/noExplicitAny: minimal stub for the test boundary
    logger: {} as any,
    appPkg: { dirPath: tmpDir } as Pkg,
    prompts: stubPrompts(),
    flags: { force: false, yes: true, nonInteractive: true },
    ...overrides,
  };
}

function uninstallCtx(overrides: Partial<UninstallContext> = {}): UninstallContext {
  return {
    shell: {} as ShellService,
    // biome-ignore lint/suspicious/noExplicitAny: minimal stub
    logger: {} as any,
    appPkg: { dirPath: tmpDir } as Pkg,
    prompts: stubPrompts(),
    flags: { yes: true, nonInteractive: true },
    ...overrides,
  };
}

function stubPrompts(overrides: Partial<ClackPrompts> = {}): ClackPrompts {
  const cancelSymbol = Symbol("clack:cancel");
  return {
    select: vi.fn(async (_opts) => "lib" as unknown) as unknown as ClackPrompts["select"],
    confirm: vi.fn(async () => true),
    isCancel: (value): value is symbol => value === cancelSymbol,
    ...overrides,
  };
}

describe("@rrlab/tsdown-plugin install()", () => {
  describe("non-interactive (--yes / nonInteractive)", () => {
    it("creates tsdown.config.ts with the default preset (lib) when no file exists", async () => {
      const result = await install(installCtx());
      expect(result.devDependencies).toEqual({
        tsdown: expect.stringMatching(/\^?\d/),
        "@rrlab/tsdown-config": expect.stringMatching(/\^?\d/),
      });
      expect(result.files).toHaveLength(1);
      const op = result.files?.[0];
      if (op?.kind !== "create") throw new Error("expected create op");
      expect(op.path).toBe("tsdown.config.ts");
      expect(op.content).toContain(`import { defineLibConfig } from "@rrlab/tsdown-config"`);
      expect(op.content).toContain("export default defineLibConfig();");
    });

    it("skips (only emits tsdown dep) when a config file already exists", async () => {
      // Under --yes, we don't silently rewrite user code.
      await fs.writeFile(
        path.join(tmpDir, "tsdown.config.ts"),
        'import { defineConfig } from "tsdown";\nexport default defineConfig({});\n',
      );
      const result = await install(installCtx());
      expect(result.devDependencies).toEqual({ tsdown: expect.any(String) });
      expect(result.files).toBeUndefined();
    });
  });

  describe("interactive — no existing file", () => {
    it("asks confirm; user can decline", async () => {
      const confirm = vi.fn(async () => false);
      const result = await install(
        installCtx({
          flags: { force: false, yes: false, nonInteractive: false },
          prompts: stubPrompts({ confirm }),
        }),
      );
      expect(confirm).toHaveBeenCalledOnce();
      expect(result.devDependencies).toEqual({ tsdown: expect.any(String) });
      expect(result.files).toBeUndefined();
    });

    it("scaffolds with `bin` preset when the user picks it", async () => {
      const select = vi.fn(async () => "bin" as unknown) as unknown as ClackPrompts["select"];
      const result = await install(
        installCtx({
          flags: { force: false, yes: false, nonInteractive: false },
          prompts: stubPrompts({ select }),
        }),
      );
      const op = result.files?.[0];
      if (op?.kind !== "create") throw new Error("expected create op");
      expect(op.content).toContain("defineBinConfig");
      expect(op.content).not.toContain("defineLibConfig");
    });
  });

  describe("interactive — existing file", () => {
    it("offers a 3-way choice and patches the existing file when user picks patch", async () => {
      await fs.writeFile(
        path.join(tmpDir, "tsdown.config.ts"),
        'import { defineConfig } from "tsdown";\nexport default defineConfig({ entry: ["src/lib.ts"] });\n',
      );
      // First select: action (patch). Second select: preset (lib).
      const select = vi.fn();
      select.mockResolvedValueOnce("patch");
      select.mockResolvedValueOnce("lib");
      const result = await install(
        installCtx({
          flags: { force: false, yes: false, nonInteractive: false },
          prompts: stubPrompts({ select: select as unknown as ClackPrompts["select"] }),
        }),
      );
      expect(select).toHaveBeenCalledTimes(2);
      const op = result.files?.[0];
      if (op?.kind !== "edit-text") throw new Error("expected edit-text op");
      const input = await fs.readFile(path.join(tmpDir, "tsdown.config.ts"), "utf8");
      const next = op.edit(input);
      // magicast emits braces with no inner spaces; match the import shape loosely.
      expect(next).toMatch(/import\s*\{\s*defineLibConfig\s*\}\s*from\s*["']@rrlab\/tsdown-config["']/);
      expect(next).not.toContain(`from "tsdown"`);
      expect(next).toContain(`defineLibConfig({`);
      expect(next).toContain(`entry: ["src/lib.ts"]`);
    });

    it("patches a .mjs config file by extension", async () => {
      await fs.writeFile(
        path.join(tmpDir, "tsdown.config.mjs"),
        'import { defineConfig } from "tsdown";\nexport default defineConfig();\n',
      );
      const select = vi.fn();
      select.mockResolvedValueOnce("patch");
      select.mockResolvedValueOnce("lib");
      const result = await install(
        installCtx({
          flags: { force: false, yes: false, nonInteractive: false },
          prompts: stubPrompts({ select: select as unknown as ClackPrompts["select"] }),
        }),
      );
      const op = result.files?.[0];
      if (op?.kind !== "edit-text") throw new Error("expected edit-text op");
      expect(op.path).toBe("tsdown.config.mjs");
    });

    it("emits a create op with overwrite when the user picks overwrite", async () => {
      await fs.writeFile(path.join(tmpDir, "tsdown.config.ts"), "// custom\n");
      const select = vi.fn();
      select.mockResolvedValueOnce("overwrite");
      select.mockResolvedValueOnce("lib");
      const result = await install(
        installCtx({
          flags: { force: false, yes: false, nonInteractive: false },
          prompts: stubPrompts({ select: select as unknown as ClackPrompts["select"] }),
        }),
      );
      const op = result.files?.[0];
      if (op?.kind !== "create") throw new Error("expected create op");
      expect(op.overwrite).toBe(true);
      expect(op.content).toContain("defineLibConfig()");
    });

    it("returns no file ops when the user picks skip", async () => {
      await fs.writeFile(path.join(tmpDir, "tsdown.config.ts"), "// custom\n");
      const select = vi.fn();
      select.mockResolvedValueOnce("skip");
      const result = await install(
        installCtx({
          flags: { force: false, yes: false, nonInteractive: false },
          prompts: stubPrompts({ select: select as unknown as ClackPrompts["select"] }),
        }),
      );
      expect(result.files).toBeUndefined();
      expect(result.devDependencies).toEqual({ tsdown: expect.any(String) });
    });
  });

  describe("patchToFactory refusal", () => {
    it("throws when the default export is not a function call", async () => {
      await fs.writeFile(path.join(tmpDir, "tsdown.config.ts"), 'export default { entry: ["src/index.ts"] };\n');
      const select = vi.fn();
      select.mockResolvedValueOnce("patch");
      select.mockResolvedValueOnce("lib");
      const result = await install(
        installCtx({
          flags: { force: false, yes: false, nonInteractive: false },
          prompts: stubPrompts({ select: select as unknown as ClackPrompts["select"] }),
        }),
      );
      const op = result.files?.[0];
      if (op?.kind !== "edit-text") throw new Error("expected edit-text op");
      const input = await fs.readFile(path.join(tmpDir, "tsdown.config.ts"), "utf8");
      expect(() => op.edit(input)).toThrowError(/not a direct function call/);
    });

    it("throws when the default export calls an unknown function", async () => {
      await fs.writeFile(path.join(tmpDir, "tsdown.config.ts"), "export default someOtherBuilder({ entry: [] });\n");
      const select = vi.fn();
      select.mockResolvedValueOnce("patch");
      select.mockResolvedValueOnce("lib");
      const result = await install(
        installCtx({
          flags: { force: false, yes: false, nonInteractive: false },
          prompts: stubPrompts({ select: select as unknown as ClackPrompts["select"] }),
        }),
      );
      const op = result.files?.[0];
      if (op?.kind !== "edit-text") throw new Error("expected edit-text op");
      const input = await fs.readFile(path.join(tmpDir, "tsdown.config.ts"), "utf8");
      expect(() => op.edit(input)).toThrowError(/someOtherBuilder/);
    });
  });
});

describe("@rrlab/tsdown-plugin uninstall()", () => {
  it("returns removeDependencies and no file ops when no config file exists", async () => {
    const result = await uninstall(uninstallCtx());
    expect(result.removeDependencies).toEqual(["tsdown", "@rrlab/tsdown-config"]);
    expect(result.files).toBeUndefined();
  });

  it("emits a delete op when the file is a pure scaffold (no args)", async () => {
    await fs.writeFile(
      path.join(tmpDir, "tsdown.config.ts"),
      'import { defineLibConfig } from "@rrlab/tsdown-config";\n\nexport default defineLibConfig();\n',
    );
    const result = await uninstall(uninstallCtx());
    const op = result.files?.[0];
    if (op?.kind !== "delete") throw new Error("expected delete op");
    expect(op.path).toBe("tsdown.config.ts");
  });

  it("patches back to defineConfig from tsdown when the scaffold has user args", async () => {
    const original =
      'import { defineLibConfig } from "@rrlab/tsdown-config";\n\nexport default defineLibConfig({ entry: ["src/lib.ts"] });\n';
    await fs.writeFile(path.join(tmpDir, "tsdown.config.ts"), original);
    const result = await uninstall(uninstallCtx());
    const op = result.files?.[0];
    if (op?.kind !== "edit-text") throw new Error("expected edit-text op");
    const next = op.edit(original);
    expect(next).toMatch(/import\s*\{\s*defineConfig\s*\}\s*from\s*["']tsdown["']/);
    expect(next).not.toContain(`from "@rrlab/tsdown-config"`);
    expect(next).toContain(`defineConfig({`);
    expect(next).toContain(`entry: ["src/lib.ts"]`);
  });

  it("leaves the file alone when it doesn't use our factories", async () => {
    await fs.writeFile(
      path.join(tmpDir, "tsdown.config.ts"),
      'import { defineConfig } from "tsdown";\nexport default defineConfig({ entry: ["src/x.ts"] });\n',
    );
    const result = await uninstall(uninstallCtx());
    expect(result.removeDependencies).toEqual(["tsdown", "@rrlab/tsdown-config"]);
    expect(result.files).toBeUndefined();
  });

  it("leaves the file alone when our factory was imported from a different package", async () => {
    // Edge case: someone reused the name `defineLibConfig` from elsewhere.
    await fs.writeFile(
      path.join(tmpDir, "tsdown.config.ts"),
      'import { defineLibConfig } from "some-other-pkg";\n\nexport default defineLibConfig();\n',
    );
    const result = await uninstall(uninstallCtx());
    expect(result.files).toBeUndefined();
  });
});
