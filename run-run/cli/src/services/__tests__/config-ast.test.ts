import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { generateCode, parseModule } from "magicast";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConfigAstService } from "#src/services/config-ast.ts";

const svc = new ConfigAstService();

const EMPTY_CONFIG = `import { defineConfig } from "@rrlab/cli/config";

export default defineConfig({
  plugins: [],
});
`;

const ONE_PLUGIN_CONFIG = `import { defineConfig } from "@rrlab/cli/config";
import biome from "@rrlab/biome-plugin";

export default defineConfig({
  plugins: [biome()],
});
`;

const TWO_PLUGINS_CONFIG = `import { defineConfig } from "@rrlab/cli/config";
import biome from "@rrlab/biome-plugin";
import ts from "@rrlab/ts-plugin";

export default defineConfig({
  plugins: [biome(), ts()],
});
`;

describe("ConfigAstService", () => {
  describe("listPlugins / hasPlugin", () => {
    it("returns empty list for an empty plugins array", () => {
      const mod = parseModule(EMPTY_CONFIG);
      expect(svc.listPlugins(mod)).toEqual([]);
      expect(svc.hasPlugin(mod, "biome")).toBe(false);
    });

    it("lists existing plugins by their local binding name", () => {
      const mod = parseModule(TWO_PLUGINS_CONFIG);
      expect(svc.listPlugins(mod)).toEqual(["biome", "ts"]);
      expect(svc.hasPlugin(mod, "biome")).toBe(true);
      expect(svc.hasPlugin(mod, "ts")).toBe(true);
      expect(svc.hasPlugin(mod, "tsdown")).toBe(false);
    });
  });

  describe("addPlugin", () => {
    it("adds the import and pushes a call onto plugins[]", () => {
      const mod = parseModule(EMPTY_CONFIG);
      const result = svc.addPlugin(mod, { exportName: "biome", pkgName: "@rrlab/biome-plugin" });
      expect(result.changed).toBe(true);
      const { code } = generateCode(mod);
      expect(code).toContain(`import biome from "@rrlab/biome-plugin"`);
      expect(code).toMatch(/plugins:\s*\[\s*biome\(\)\s*\]/);
    });

    it("is idempotent — adding the same plugin twice produces a single entry", () => {
      const mod = parseModule(ONE_PLUGIN_CONFIG);
      const result = svc.addPlugin(mod, { exportName: "biome", pkgName: "@rrlab/biome-plugin" });
      expect(result.changed).toBe(false);
      expect(svc.listPlugins(mod)).toEqual(["biome"]);
    });

    it("appends to an existing plugins list without disturbing the others", () => {
      const mod = parseModule(ONE_PLUGIN_CONFIG);
      const result = svc.addPlugin(mod, { exportName: "tsdown", pkgName: "@rrlab/ts-plugindown" });
      expect(result.changed).toBe(true);
      expect(svc.listPlugins(mod)).toEqual(["biome", "tsdown"]);
      const { code } = generateCode(mod);
      expect(code).toContain(`import tsdown from "@rrlab/ts-plugindown"`);
      expect(code).toContain(`import biome from "@rrlab/biome-plugin"`);
    });
  });

  describe("removePlugin", () => {
    it("removes the call and the import binding", () => {
      const mod = parseModule(TWO_PLUGINS_CONFIG);
      const result = svc.removePlugin(mod, "ts");
      expect(result.changed).toBe(true);
      expect(svc.listPlugins(mod)).toEqual(["biome"]);
      const { code } = generateCode(mod);
      expect(code).not.toContain(`import ts from "@rrlab/ts-plugin"`);
    });

    it("is a no-op for a plugin that is not present", () => {
      const mod = parseModule(ONE_PLUGIN_CONFIG);
      const result = svc.removePlugin(mod, "tsdown");
      expect(result.changed).toBe(false);
      expect(svc.listPlugins(mod)).toEqual(["biome"]);
    });
  });

  describe("load + save round-trip", () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "rr-cfg-ast-"));
    });

    afterEach(async () => {
      await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it("returns isNew=true and a fresh template when no config exists", async () => {
      const loaded = await svc.load(tmpDir);
      expect(loaded.isNew).toBe(true);
      expect(loaded.filepath).toMatch(/run-run\.config\.mts$/);
      expect(svc.listPlugins(loaded.mod)).toEqual([]);
    });

    it("reads, edits, and writes back an existing config preserving the file path", async () => {
      const cfgPath = path.join(tmpDir, "run-run.config.mts");
      await fs.writeFile(cfgPath, ONE_PLUGIN_CONFIG, "utf8");

      const loaded = await svc.load(tmpDir);
      expect(loaded.isNew).toBe(false);
      expect(loaded.filepath).toBe(cfgPath);

      svc.addPlugin(loaded.mod, { exportName: "ts", pkgName: "@rrlab/ts-plugin" });
      await svc.save(loaded);

      const written = await fs.readFile(cfgPath, "utf8");
      expect(written).toContain(`import biome from "@rrlab/biome-plugin"`);
      expect(written).toContain(`import ts from "@rrlab/ts-plugin"`);
      expect(written).toMatch(/plugins:\s*\[\s*biome\(\),\s*ts\(\)\s*\]/);
    });

    it("writes a brand-new minimal config when none existed and a plugin was added", async () => {
      const loaded = await svc.load(tmpDir);
      svc.addPlugin(loaded.mod, { exportName: "biome", pkgName: "@rrlab/biome-plugin" });
      await svc.save(loaded);

      const written = await fs.readFile(loaded.filepath, "utf8");
      expect(written).toContain(`import { defineConfig } from "@rrlab/cli/config"`);
      expect(written).toContain(`import biome from "@rrlab/biome-plugin"`);
      expect(written).toContain(`biome()`);
    });

    it("prefers .ts over .mts when both exist", async () => {
      // .ts wins because it's first in the search order.
      await fs.writeFile(path.join(tmpDir, "run-run.config.ts"), EMPTY_CONFIG, "utf8");
      await fs.writeFile(path.join(tmpDir, "run-run.config.mts"), ONE_PLUGIN_CONFIG, "utf8");

      const loaded = await svc.load(tmpDir);
      expect(loaded.filepath).toMatch(/run-run\.config\.ts$/);
      expect(svc.listPlugins(loaded.mod)).toEqual([]);
    });
  });
});
