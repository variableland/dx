import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("plugin { only } narrowing", () => {
  let fixture: { dir: string; cleanup: () => void };

  afterEach(() => fixture?.cleanup());

  describe("biome({only:['lint','format']}) + oxc({only:['typecheck']})", () => {
    beforeEach(() => {
      fixture = makeFixture("only-biome-oxc", {
        "package.json": fixtures.pkg(),
        "biome.json": fixtures.biomeNoop(),
        "tsconfig.json": fixtures.tsconfig(),
        "run-run.config.mts": fixtures.config([
          { name: "biome", only: ["lint", "format"] },
          { name: "oxc", only: ["typecheck"] },
        ]),
        "src/ok.ts": "export const ok = 1;\n",
      });
    });

    // The board row label is the provider's `ui`, so it tells us which tool was
    // dispatched: biome → "biome", oxc's type-checker → "oxlint".
    test("rr lint dispatches to biome", () => {
      const r = cli("lint", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(combined).toContain("biome");
      expect(combined).not.toContain("oxlint");
      expect(r.status).toBe(0);
    });

    test("rr format dispatches to biome", () => {
      const r = cli("format", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(combined).toContain("biome");
      expect(combined).not.toContain("oxlint");
      expect(r.status).toBe(0);
    });

    test("rr tsc dispatches to oxlint", () => {
      const r = cli("tsc", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      // The tsc row is labelled "tsc"; oxlint identity shows in its flushed
      // output: either its `N warnings and M errors` summary or the `tsgolint`
      // type-checker it shells out to — both are oxlint-exclusive markers.
      expect(combined).toMatch(/\d+ warnings? and \d+ errors?|tsgolint/i);
    });

    test("rr jsc composes biome's lint+format (biome's direct jsc was narrowed away)", () => {
      const r = cli("jsc", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      // Composed jsc renders one row labelled with both providers' ui ("biome + biome").
      expect(combined).toMatch(/biome \+ biome/);
      expect(r.status).toBe(0);
    });
  });

  describe("oxc({only:['typecheck']}) alone", () => {
    beforeEach(() => {
      fixture = makeFixture("only-oxc-tsc", {
        "package.json": fixtures.pkg(),
        "run-run.config.mts": fixtures.config([{ name: "oxc", only: ["typecheck"] }]),
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
