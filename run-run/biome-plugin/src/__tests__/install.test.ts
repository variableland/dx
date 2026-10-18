import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type ClackPrompts, type InstallContext, ReleaseService, type UninstallContext } from "@rrlab/cli/plugin";
import type { Pkg, ShellService } from "@variablelab/clibuddy";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { install, uninstall } from "../index.ts";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "rr-biome-plugin-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

const writeBiomeJson = (content: string) => fs.writeFile(path.join(tmpDir, "biome.json"), content, "utf8");

function appPkg(): Pkg {
  return { dirPath: tmpDir, packageJson: {} } as Pkg;
}

function installCtx(overrides: Partial<InstallContext> = {}): InstallContext {
  return {
    shell: {} as ShellService,
    // biome-ignore lint/suspicious/noExplicitAny: minimal stub for the test boundary
    logger: {} as any,
    appPkg: appPkg(),
    prompts: stubPrompts(),
    flags: { force: false, yes: true, nonInteractive: true },
    release: new ReleaseService(undefined),
    ...overrides,
  };
}

function uninstallCtx(overrides: Partial<UninstallContext> = {}): UninstallContext {
  return {
    shell: {} as ShellService,
    // biome-ignore lint/suspicious/noExplicitAny: minimal stub
    logger: {} as any,
    appPkg: appPkg(),
    prompts: stubPrompts(),
    flags: { yes: true, nonInteractive: true },
    ...overrides,
  };
}

function stubPrompts(overrides: Partial<ClackPrompts> = {}): ClackPrompts {
  const cancelSymbol = Symbol("clack:cancel");
  return {
    select: vi.fn(async () => "patch" as unknown) as unknown as ClackPrompts["select"],
    confirm: vi.fn(async () => true),
    isCancel: (value): value is symbol => value === cancelSymbol,
    ...overrides,
  };
}

/** The `edit-text` step that the patch branch returns after its `edit-json`. */
async function formatStep(): Promise<(source: string) => string> {
  const op = (await install(installCtx())).files?.[1];
  if (op?.kind !== "edit-text") throw new Error("expected an edit-text op");
  return op.edit;
}

describe("@rrlab/biome-plugin install()", () => {
  it("creates a biome.json that extends the preset, in Biome's format, when none exists", async () => {
    const result = await install(installCtx());
    expect(result.devDependencies).toEqual({
      "@biomejs/biome": expect.stringMatching(/\^?\d/),
      "@rrlab/biome-config": "latest",
    });
    expect(result.files).toEqual([
      {
        kind: "create",
        path: "biome.json",
        content: `{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": ["@rrlab/biome-config"]
}
`,
        overwrite: false,
      },
    ]);
  });

  describe("patching an existing biome.json", () => {
    it("adds the preset with an edit-json, then formats the file with an edit-text", async () => {
      await writeBiomeJson("{}\n");
      const result = await install(installCtx());
      expect(result.files?.map((op) => `${op.kind} ${op.path}`)).toEqual(["edit-json biome.json", "edit-text biome.json"]);
      const patch = result.files?.[0];
      if (patch?.kind !== "edit-json") throw new Error("expected an edit-json op");
      expect(patch.edits).toEqual([
        { op: "set", path: "/$schema", value: "./node_modules/@biomejs/biome/configuration_schema.json", mode: "if-missing" },
        { op: "include", path: "/extends", value: "@rrlab/biome-config", position: "start" },
      ]);
    });

    it("formats with the config on disk, as Biome's format check wants it", async () => {
      // What the edit-json leaves on disk: 2-space indent, one array item per line.
      const patched = `{
  "formatter": {
    "indentStyle": "tab"
  },
  "files": {
    "includes": [
      "**",
      "!dist"
    ]
  }
}
`;
      await writeBiomeJson(patched);
      const format = await formatStep();
      expect(format(patched)).toMatchInlineSnapshot(`
        "{
        	"formatter": {
        		"indentStyle": "tab"
        	},
        	"files": {
        		"includes": ["**", "!dist"]
        	}
        }
        "
      `);
    });

    it("returns the source as it is when it isn't valid JSON", async () => {
      await writeBiomeJson("{}\n");
      const format = await formatStep();
      expect(format(`{ "extends": [`)).toBe(`{ "extends": [`);
    });

    it("returns the source as it is when Biome can't load the config on disk", async () => {
      // The preset isn't installed in the temp dir, so Biome can't resolve the `extends`.
      const patched = `{\n  "extends": [\n    "@rrlab/biome-config"\n  ]\n}\n`;
      await writeBiomeJson(patched);
      const format = await formatStep();
      expect(format(patched)).toBe(patched);
    });
  });
});

describe("@rrlab/biome-plugin uninstall()", () => {
  it("returns removeDependencies and no file ops when biome.json doesn't exist", async () => {
    const result = await uninstall(uninstallCtx());
    expect(result).toEqual({ removeDependencies: ["@biomejs/biome", "@rrlab/biome-config"] });
  });

  it("deletes biome.json when it only extends the preset", async () => {
    await writeBiomeJson(`{ "$schema": "./schema.json", "extends": ["@rrlab/biome-config"] }`);
    const result = await uninstall(uninstallCtx());
    expect(result.files).toEqual([{ kind: "delete", path: "biome.json" }]);
  });

  it("drops the preset and an emptied extends when biome.json has other settings", async () => {
    await writeBiomeJson(`{ "extends": ["@rrlab/biome-config"], "linter": { "enabled": false } }`);
    const result = await uninstall(uninstallCtx());
    expect(result.files).toEqual([
      {
        kind: "edit-json",
        path: "biome.json",
        edits: [
          { op: "exclude", path: "/extends", value: "@rrlab/biome-config" },
          { op: "unset", path: "/extends" },
        ],
      },
    ]);
  });

  it("keeps the other extends", async () => {
    await writeBiomeJson(`{ "extends": ["@rrlab/biome-config", "./base.json"] }`);
    const result = await uninstall(uninstallCtx());
    expect(result.files).toEqual([
      { kind: "edit-json", path: "biome.json", edits: [{ op: "exclude", path: "/extends", value: "@rrlab/biome-config" }] },
    ]);
  });
});
