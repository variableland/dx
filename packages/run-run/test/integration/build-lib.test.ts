import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr build:lib", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeFixture("build-lib", {
      "package.json": fixtures.pkg(),
    });
  });

  afterEach(() => fixture.cleanup());

  test("doctor: exits 0 and reports tsdown ok", () => {
    const r = cli("build:lib doctor", { cwd: fixture.dir });
    expect(r.stderr).toBe("");
    expect(r.stdout).toContain("tsdown ok");
    expect(r.status).toBe(0);
  });
});
