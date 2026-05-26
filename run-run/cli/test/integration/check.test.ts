import { afterEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr check", () => {
  let fixture: { dir: string; cleanup: () => void };

  afterEach(() => fixture?.cleanup());

  test("dispatches to both jsc and tsc when the project is clean", () => {
    fixture = makeFixture("check-ok", {
      "package.json": fixtures.pkg(),
      "biome.json": fixtures.biomeNoop(),
      "run-run.config.mts": fixtures.config(["biome", "ts"]),
      "tsconfig.json": fixtures.tsconfig(),
      "src/ok.ts": "export const ok: number = 1;\n",
    });
    const r = cli("check", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    // Single-package fixture → each section is a one-row board: jsc's row is
    // labelled "biome", tsc's row "tsc". `check` closes with an overall verdict.
    expect(combined).toContain("biome");
    expect(combined).toContain("tsc");
    expect(combined).toContain("check passed");
    expect(r.status).toBe(0);
  });

  test("exits non-zero when the TS sibling reports an error", () => {
    fixture = makeFixture("check-tsc-fail", {
      "package.json": fixtures.pkg(),
      "biome.json": fixtures.biomeNoop(),
      "run-run.config.mts": fixtures.config(["biome", "ts"]),
      "tsconfig.json": fixtures.tsconfig(),
      "src/bad.ts": 'export const bad: number = "not a number";\n',
    });
    const r = cli("check", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    expect(combined).toMatch(/Type 'string' is not assignable to type 'number'/);
    expect(combined).toContain("check failed"); // overall verdict names the failure
    expect(r.status).not.toBe(0);
  });

  test("reports the failure with the sibling name when one of them throws", () => {
    // No `ts` plugin in config → `rr tsc` throws "no plugin provides 'tsc'".
    // `rr jsc` still runs (biome is configured). `check` aggregates: jsc ok,
    // tsc failed, overall exit non-zero, error mentions `tsc`.
    fixture = makeFixture("check-missing-tsc-plugin", {
      "package.json": fixtures.pkg(),
      "biome.json": fixtures.biomeNoop(),
      "run-run.config.mts": fixtures.config(["biome"]),
      "src/ok.ts": "export const ok = 1;\n",
    });
    const r = cli("check", { cwd: fixture.dir });
    expect(r.stderr + r.stdout).toMatch(/rr check \(tsc\)/);
    expect(r.status).not.toBe(0);
  });
});
