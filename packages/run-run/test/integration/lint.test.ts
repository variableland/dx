import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr lint", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeFixture("lint", {
      "package.json": fixtures.pkg(),
      "biome.json": fixtures.biomeNoop(),
      "src/ok.ts": "export const ok = 1;\n",
    });
  });

  afterEach(() => fixture.cleanup());

  test("doctor: exits 0 and reports biome ok", () => {
    const r = cli("lint doctor", { cwd: fixture.dir });
    expect(r.stderr).toBe("");
    expect(r.stdout).toContain("biome ok");
    expect(r.status).toBe(0);
  });

  test("runs biome check with formatter disabled end-to-end", () => {
    const r = cli("lint", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    expect(combined).toMatch(/\$ biome check .*--formatter-enabled=false/);
    expect(r.status).toBe(0);
  });
});
