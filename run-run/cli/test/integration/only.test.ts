import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("plugin { only } narrowing", () => {
  let fixture: { dir: string; cleanup: () => void };

  afterEach(() => fixture?.cleanup());

  describe("biome({only:['lint','format']}) + oxc({only:['tsc']})", () => {
    beforeEach(() => {
      fixture = makeFixture("only-biome-oxc", {
        "package.json": fixtures.pkg(),
        "biome.json": fixtures.biomeNoop(),
        "tsconfig.json": fixtures.tsconfig(),
        "run-run.config.mts": fixtures.config([
          { alias: "biome", only: ["lint", "format"] },
          { alias: "oxc", only: ["tsc"] },
        ]),
        "src/ok.ts": "export const ok = 1;\n",
      });
    });

    test("rr lint dispatches to biome", () => {
      const r = cli("lint", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(combined).toMatch(/\$ biome check .*--formatter-enabled=false/);
      expect(r.status).toBe(0);
    });

    test("rr format dispatches to biome", () => {
      const r = cli("format", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(combined).toMatch(/\$ biome format/);
      expect(r.status).toBe(0);
    });

    test("rr tsc dispatches to oxlint with --type-aware --type-check", () => {
      const r = cli("tsc", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(combined).toMatch(/\$ oxlint --type-aware --type-check/);
    });

    test("rr jsc composes biome's lint+format (biome's direct jsc was narrowed away)", () => {
      const r = cli("jsc", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(combined).toMatch(/\$ biome (check|format)/);
      expect(r.status).toBe(0);
    });
  });

  describe("oxc({only:['tsc']}) alone", () => {
    beforeEach(() => {
      fixture = makeFixture("only-oxc-tsc", {
        "package.json": fixtures.pkg(),
        "run-run.config.mts": fixtures.config([{ alias: "oxc", only: ["tsc"] }]),
        "src/ok.ts": "export const ok = 1;\n",
      });
    });

    test("rr lint has no provider — oxc's lint was narrowed away", () => {
      const r = cli("lint", { cwd: fixture.dir });
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toMatch(/no plugin provides|lint/i);
    });
  });

  describe("conflict — biome and oxc both unrestricted", () => {
    beforeEach(() => {
      fixture = makeFixture("only-conflict", {
        "package.json": fixtures.pkg(),
        "biome.json": fixtures.biomeNoop(),
        "run-run.config.mts": fixtures.config(["biome", "oxc"]),
        "src/ok.ts": "export const ok = 1;\n",
      });
    });

    test("rr lint reports the multi-provider conflict and suggests the 'only' option", () => {
      const r = cli("lint", { cwd: fixture.dir });
      expect(r.status).not.toBe(0);
      const combined = r.stdout + r.stderr;
      expect(combined).toMatch(/Multiple plugins provide capability 'lint'/);
      expect(combined).toMatch(/only:\s*\['lint'\]/);
    });
  });
});
