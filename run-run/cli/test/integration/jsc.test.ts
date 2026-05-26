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

  test("doctor: exits 0 and reports biome healthy as a board row", () => {
    const r = cli("jsc doctor", { cwd: fixture.dir });
    expect(r.stdout + r.stderr).toContain("biome");
    expect(r.status).toBe(0);
  });

  test("runs biome end-to-end on a clean fixture and renders the board", () => {
    const r = cli("jsc", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    // Compact board: one row labelled with the tool + the target package, since
    // jsc runs whole-repo (no per-package fan-out). A clean exit also proves
    // biome ran with valid flags (malformed flags fail).
    expect(combined).toContain("biome");
    expect(combined).toContain("rr-test-fixture"); // the target package name
    expect(combined).not.toMatch(/expected `COMMAND/);
    expect(r.status).toBe(0);
  });
});
