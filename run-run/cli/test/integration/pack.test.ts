import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr pack", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeFixture("pack", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["tsdown"]),
    });
  });

  afterEach(() => fixture.cleanup());

  test("doctor: exits 0 and reports tsdown healthy as a board row", () => {
    const r = cli("pack doctor", { cwd: fixture.dir });
    expect(r.stdout + r.stderr).toContain("tsdown");
    expect(r.status).toBe(0);
  });
});
