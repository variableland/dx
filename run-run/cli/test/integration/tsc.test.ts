import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr tsc", () => {
  let fixture: { dir: string; cleanup: () => void };

  afterEach(() => fixture?.cleanup());

  describe("doctor", () => {
    beforeEach(() => {
      fixture = makeFixture("tsc-doctor", {
        "package.json": fixtures.pkg(),
        "run-run.config.mts": fixtures.config(["ts"]),
        "tsconfig.json": fixtures.tsconfig(),
      });
    });

    test("exits 0 and reports tsc ok", () => {
      const r = cli("tsc doctor", { cwd: fixture.dir });
      expect(r.stderr).toBe("");
      expect(r.stdout).toContain("tsc ok");
      expect(r.status).toBe(0);
    });
  });

  describe("happy path", () => {
    beforeEach(() => {
      fixture = makeFixture("tsc-ok", {
        "package.json": fixtures.pkg(),
        "run-run.config.mts": fixtures.config(["ts"]),
        "tsconfig.json": fixtures.tsconfig(),
        "src/ok.ts": "export const ok: number = 1;\n",
      });
    });

    test("exits 0 when types check cleanly", () => {
      const r = cli("tsc", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(combined).toMatch(/\$ tsc --noEmit/);
      expect(r.status).toBe(0);
    });
  });

  describe("type error path", () => {
    beforeEach(() => {
      fixture = makeFixture("tsc-bad", {
        "package.json": fixtures.pkg(),
        "run-run.config.mts": fixtures.config(["ts"]),
        "tsconfig.json": fixtures.tsconfig(),
        "src/bad.ts": 'export const bad: number = "not a number";\n',
      });
    });

    test("surfaces the type error and exits non-zero", () => {
      const r = cli("tsc", { cwd: fixture.dir });
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toMatch(/Type 'string' is not assignable to type 'number'/);
    });
  });
});
