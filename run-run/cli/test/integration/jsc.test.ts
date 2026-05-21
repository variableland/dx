import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr jsc", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeFixture("jsc", {
      "package.json": fixtures.pkg(),
      "biome.json": fixtures.biomeNoop(),
      "run-run.config.mts": fixtures.config(["biome"]),
      "src/ok.ts": "export const ok = 1;\n",
    });
  });

  afterEach(() => fixture.cleanup());

  test("doctor: exits 0 and reports biome ok", () => {
    const r = cli("jsc doctor", { cwd: fixture.dir });
    expect(r.stderr).toBe("");
    expect(r.stdout).toContain("biome ok");
    expect(r.status).toBe(0);
  });

  test("runs biome end-to-end on a clean fixture", () => {
    const r = cli("jsc", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    // `check` locally, `ci` in CI — both are valid and exercise the same path.
    expect(combined).toMatch(/\$ biome (check|ci)/);
    expect(combined).not.toMatch(/expected `COMMAND/);
    expect(r.status).toBe(0);
  });

  test("forwards each biome flag as its own argv entry", () => {
    const r = cli("jsc", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    expect(combined).toMatch(/\$ biome (check|ci) --colors=force --no-errors-on-unmatched/);
    expect(r.status).toBe(0);
  });
});
