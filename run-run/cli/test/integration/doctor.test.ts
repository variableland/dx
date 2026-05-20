import { afterEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr doctor", () => {
  let fixture: { dir: string; cleanup: () => void };

  afterEach(() => fixture?.cleanup());

  test("hints toward `plugins add` when no plugins are configured", () => {
    fixture = makeFixture("doctor-empty", {
      "package.json": fixtures.pkg(),
    });
    const r = cli("doctor", { cwd: fixture.dir });
    expect(r.stdout + r.stderr).toMatch(/No plugins configured/);
    expect(r.status).toBe(0);
  });

  test("reports each configured plugin once even when one service backs multiple capabilities", () => {
    fixture = makeFixture("doctor-biome", {
      "package.json": fixtures.pkg(),
      "biome.json": fixtures.biomeNoop(),
      "run-run.config.mts": fixtures.config(["biome"]),
    });
    const r = cli("doctor", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    // biome plugin backs lint + format + jsc with the same BiomeService.
    // Doctor should run once, not three times.
    const okCount = (combined.match(/biome ok/g) ?? []).length;
    expect(okCount).toBe(1);
    expect(r.status).toBe(0);
  });

  test("aggregates results across multiple plugins", () => {
    fixture = makeFixture("doctor-multi", {
      "package.json": fixtures.pkg(),
      "biome.json": fixtures.biomeNoop(),
      "tsconfig.json": fixtures.tsconfig(),
      "run-run.config.mts": fixtures.config(["biome", "ts"]),
    });
    const r = cli("doctor", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    expect(combined).toMatch(/biome ok/);
    expect(combined).toMatch(/tsc ok/);
    expect(r.status).toBe(0);
  });
});
