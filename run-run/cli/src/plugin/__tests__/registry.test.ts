import { describe, expect, it } from "vitest";
import { PluginRegistry } from "#src/plugin/registry.ts";
import type {
  Doctor,
  Formatter,
  Linter,
  Packer,
  Plugin,
  PluginCapabilities,
  StaticChecker,
  TypeChecker,
} from "#src/plugin/types.ts";

function plugin(name: string): Plugin {
  return {
    name,
    apiVersion: 1,
    capabilities: async () => ({}),
  };
}

async function okDoctor(): ReturnType<Doctor["doctor"]> {
  return { ok: true, output: { stdout: "", stderr: "", exitCode: 0 } };
}

function fakeLinter(): Linter & Doctor {
  return { bin: "fake", ui: "Fake", lint: async () => {}, doctor: okDoctor };
}

function fakeFormatter(): Formatter & Doctor {
  return { bin: "fake", ui: "Fake", format: async () => {}, doctor: okDoctor };
}

function fakeStaticChecker(): StaticChecker & Doctor {
  return { bin: "fake", ui: "Fake", check: async () => {}, doctor: okDoctor };
}

function fakeTypeChecker(): TypeChecker & Doctor {
  return { bin: "fake", ui: "Fake", check: async () => {}, doctor: okDoctor };
}

function fakePacker(): Packer & Doctor {
  return { bin: "fake", ui: "Fake", pack: async () => {}, doctor: okDoctor };
}

describe("PluginRegistry", () => {
  describe("get(kind)", () => {
    it("returns undefined when no plugin provides the capability", () => {
      const registry = new PluginRegistry();
      expect(registry.get("lint")).toBeUndefined();
    });

    it("returns the impl when exactly one plugin provides the capability", () => {
      const registry = new PluginRegistry();
      const linter = fakeLinter();
      registry.register(plugin("biome"), { lint: linter });
      expect(registry.get("lint")).toBe(linter);
    });

    it("does not collide across kinds", () => {
      const registry = new PluginRegistry();
      const linter = fakeLinter();
      const formatter = fakeFormatter();
      registry.register(plugin("oxc"), { lint: linter, format: formatter });
      expect(registry.get("lint")).toBe(linter);
      expect(registry.get("format")).toBe(formatter);
      expect(registry.get("jsc")).toBeUndefined();
    });

    it("throws when two plugins provide the same capability, listing both", () => {
      const registry = new PluginRegistry();
      registry.register(plugin("biome"), { lint: fakeLinter() });
      registry.register(plugin("eslint"), { lint: fakeLinter() });
      expect(() => registry.get("lint")).toThrowError(/biome.*eslint|eslint.*biome/);
    });

    it("suggests the 'only' option when reporting multi-provider conflicts", () => {
      const registry = new PluginRegistry();
      registry.register(plugin("biome"), { lint: fakeLinter() });
      registry.register(plugin("oxc"), { lint: fakeLinter() });
      expect(() => registry.get("lint")).toThrowError(/only:\s*\['lint'\]/);
    });

    it("supports tsc and pack kinds", () => {
      const registry = new PluginRegistry();
      const tc = fakeTypeChecker();
      const packer = fakePacker();
      registry.register(plugin("ts"), { tsc: tc });
      registry.register(plugin("tsdown"), { pack: packer });
      expect(registry.get("tsc")).toBe(tc);
      expect(registry.get("pack")).toBe(packer);
    });
  });

  describe("providersOf(kind)", () => {
    it("returns all plugin names that provide the kind", () => {
      const registry = new PluginRegistry();
      registry.register(plugin("biome"), { lint: fakeLinter() });
      registry.register(plugin("eslint"), { lint: fakeLinter() });
      registry.register(plugin("tsdown"), { pack: fakePacker() });
      const lint = registry.providersOf("lint");
      expect(lint.map((p) => p.name).sort()).toEqual(["biome", "eslint"]);
      expect(registry.providersOf("format")).toEqual([]);
    });
  });

  describe("plugins()", () => {
    it("preserves registration order", () => {
      const registry = new PluginRegistry();
      registry.register(plugin("a"), {});
      registry.register(plugin("b"), {});
      registry.register(plugin("c"), {});
      expect(registry.plugins().map((p) => p.name)).toEqual(["a", "b", "c"]);
    });
  });

  it("type-checks PluginCapabilities holds the documented kinds", () => {
    // This is purely a compile-time check; the runtime body asserts true so the
    // test counts as executed.
    const capabilities: PluginCapabilities = {
      lint: fakeLinter(),
      format: fakeFormatter(),
      jsc: fakeStaticChecker(),
      tsc: fakeTypeChecker(),
      pack: fakePacker(),
    };
    expect(Object.keys(capabilities).sort()).toEqual(["format", "jsc", "lint", "pack", "tsc"]);
  });
});
