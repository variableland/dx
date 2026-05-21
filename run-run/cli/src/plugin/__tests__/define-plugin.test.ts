import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import { describe, expect, it } from "vitest";
import { definePlugin } from "#src/plugin/define-plugin.ts";
import { ToolService } from "#src/plugin/tool-service.ts";
import type { Formatter, Linter, PluginContext, StaticChecker, TypeChecker } from "#src/plugin/types.ts";

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

const FROM = import.meta.url;

class FakeBiome extends ToolService implements Linter, Formatter, StaticChecker {
  constructor() {
    super({ pkg: "@biomejs/biome", bin: "biome", ui: "fake", shellService: {} as ShellService, from: FROM });
  }
  async lint() {}
  async format() {}
  async check() {}
}

class FakeTsc extends ToolService implements TypeChecker {
  constructor() {
    super({ pkg: "typescript", bin: "tsc", ui: "fake", shellService: {} as ShellService, from: FROM });
  }
  async check() {}
}

class MissingService extends ToolService implements Linter {
  constructor() {
    super({
      pkg: "ghostly-bin-that-does-not-exist",
      ui: "fake",
      shellService: {} as ShellService,
      from: FROM,
    });
  }
  async lint() {}
}

describe("definePlugin", () => {
  it("returns a Plugin shape the registry expects", async () => {
    const factory = definePlugin(() => ({
      name: "fake-linter",
      apiVersion: 1 as const,
      capabilities: () => ({ lint: new FakeBiome() }),
    }));
    const plugin = factory();
    expect(plugin.name).toBe("fake-linter");
    expect(plugin.apiVersion).toBe(1);
    expect(typeof plugin.capabilities).toBe("function");
    const caps = await plugin.capabilities(ctx());
    expect(Object.keys(caps)).toEqual(["lint"]);
  });

  it("filters capabilities by 'only'", async () => {
    const factory = definePlugin(() => ({
      name: "biome",
      apiVersion: 1 as const,
      capabilities: () => {
        const svc = new FakeBiome();
        return { lint: svc, format: svc, jsc: svc };
      },
    }));
    const caps = await factory({ only: ["lint", "format"] }).capabilities(ctx());
    expect(Object.keys(caps).sort()).toEqual(["format", "lint"]);
  });

  it("throws on unknown kind in 'only' with the canonical message", async () => {
    const factory = definePlugin(() => ({
      name: "biome",
      apiVersion: 1 as const,
      capabilities: () => {
        const svc = new FakeBiome();
        return { lint: svc, format: svc, jsc: svc };
      },
    }));
    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: bypass TS to exercise the runtime guard
      factory({ only: ["tsc"] as any }).capabilities(ctx()),
    ).rejects.toThrow(/@rrlab\/biome-plugin: unknown capability 'tsc' in 'only'\. Available: /);
  });

  it("throws when a required pkg is missing in the host", async () => {
    const factory = definePlugin(() => ({
      name: "ghostly",
      apiVersion: 1 as const,
      capabilities: () => ({ lint: new MissingService() }),
    }));
    await expect(factory().capabilities(ctx())).rejects.toThrow(
      /@rrlab\/ghostly-plugin requires ghostly-bin-that-does-not-exist to be installed/,
    );
  });

  it("succeeds when distinct services share a pkg (deduplicated probe)", async () => {
    const factory = definePlugin(() => ({
      name: "ts",
      apiVersion: 1 as const,
      capabilities: () => ({ tsc: new FakeTsc() }),
    }));
    const caps = await factory().capabilities(ctx());
    expect(Object.keys(caps)).toEqual(["tsc"]);
  });
});
