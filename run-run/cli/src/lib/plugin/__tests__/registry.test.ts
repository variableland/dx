import { describe, expect, it } from "vitest";
import type { PluginName } from "#src/lib/plugin/directory.ts";
import { PluginRegistry } from "#src/lib/plugin/registry.ts";
import type { Doctor, Formatter, Linter, Packer, Plugin, TypeChecker } from "#src/lib/plugin/types.ts";

function plugin(name: string): Plugin {
  return {
    name: name as PluginName,
    ui: name,
    color: (str: string) => str,
    apiVersion: 1,
    services: async () => ({}),
  };
}

// Every verb — including `doctor` — now returns a `RunReport`.
async function okReport() {
  return { ok: true, output: "" };
}

// Service impls carry their own `ui` (a real impl derives it from the plugin's
// `color`); these mocks hard-code a terse stand-in.
function fakeLinter(): Linter & Doctor {
  return { ui: "fake", lint: okReport, doctor: okReport };
}

function fakeFormatter(): Formatter & Doctor {
  return { ui: "fake", format: okReport, doctor: okReport };
}

function fakeTypeChecker(): TypeChecker & Doctor {
  return { ui: "fake", check: okReport, doctor: okReport };
}

function fakePacker(): Packer & Doctor {
  return { ui: "fake", pack: okReport, doctor: okReport };
}

describe("PluginRegistry", () => {
  describe("getService(capability)", () => {
    it("returns undefined when no plugin provides the capability", () => {
      const registry = new PluginRegistry();
      expect(registry.getService("lint")).toBeUndefined();
    });

    it("returns the impl when exactly one plugin provides the capability", () => {
      const registry = new PluginRegistry();
      const linter = fakeLinter();
      registry.register(plugin("biome"), { lint: linter });
      expect(registry.getService("lint")).toBe(linter);
    });

    it("does not collide across kinds", () => {
      const registry = new PluginRegistry();
      const linter = fakeLinter();
      const formatter = fakeFormatter();
      registry.register(plugin("oxc"), { lint: linter, format: formatter });
      expect(registry.getService("lint")).toBe(linter);
      expect(registry.getService("format")).toBe(formatter);
      expect(registry.getService("jscheck")).toBeUndefined();
    });

    it("throws when two plugins provide the same capability, listing both", () => {
      const registry = new PluginRegistry();
      registry.register(plugin("biome"), { lint: fakeLinter() });
      registry.register(plugin("oxc"), { lint: fakeLinter() });
      expect(() => registry.getService("lint")).toThrowError(/biome.*oxc|oxc.*biome/);
    });

    it("suggests the 'only' option when reporting multi-provider conflicts", () => {
      const registry = new PluginRegistry();
      registry.register(plugin("biome"), { lint: fakeLinter() });
      registry.register(plugin("oxc"), { lint: fakeLinter() });
      expect(() => registry.getService("lint")).toThrowError(/only:\s*\['lint'\]/);
    });

    it("supports typecheck and pack kinds", () => {
      const registry = new PluginRegistry();
      const tc = fakeTypeChecker();
      const packer = fakePacker();
      registry.register(plugin("ts"), { typecheck: tc });
      registry.register(plugin("tsdown"), { pack: packer });
      expect(registry.getService("typecheck")).toBe(tc);
      expect(registry.getService("pack")).toBe(packer);
    });
  });

  describe("providersOf(capability)", () => {
    it("returns every plugin that provides the capability", () => {
      const registry = new PluginRegistry();
      registry.register(plugin("biome"), { lint: fakeLinter() });
      registry.register(plugin("oxc"), { lint: fakeLinter() });
      registry.register(plugin("tsdown"), { pack: fakePacker() });
      const lint = registry.providersOf("lint");
      expect(lint.map((p) => p.plugin.name).sort()).toEqual(["biome", "oxc"]);
      expect(registry.providersOf("format")).toEqual([]);
    });
  });
});
