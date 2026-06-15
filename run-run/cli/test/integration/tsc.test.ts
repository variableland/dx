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

    test("exits 0 and reports tsc healthy as a board row", () => {
      const r = cli("tsc doctor", { cwd: fixture.dir });
      expect(r.stdout + r.stderr).toContain("tsc");
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

    test("exits 0 when types check cleanly and renders the board", () => {
      const r = cli("tsc", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      // Single package → compact board: one row labelled with the command ("tsc").
      expect(combined).toContain("tsc");
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

  describe("pre-script", () => {
    const pkgWithScripts = (scripts: Record<string, string>) =>
      `${JSON.stringify({ name: "rr-test-fixture", version: "0.0.0", private: true, scripts }, null, 2)}\n`;

    test("runs `pretscheck` before tsc and fails the task when it fails", () => {
      fixture = makeFixture("tsc-pretscheck", {
        "package.json": pkgWithScripts({ pretscheck: "echo MARK_TSCHECK && exit 1" }),
        "run-run.config.mts": fixtures.config(["ts"]),
        "tsconfig.json": fixtures.tsconfig(),
        "src/ok.ts": "export const ok: number = 1;\n",
      });

      const r = cli("tsc", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(r.status).not.toBe(0);
      // The task fails on the pre-script, before tsc runs; its captured output is surfaced.
      expect(combined).toContain("pre-script");
      expect(combined).toContain("MARK_TSCHECK");
    });

    test("prefers `pretscheck` over the legacy `pretsc`/`pretypecheck` aliases", () => {
      fixture = makeFixture("tsc-pretscheck-precedence", {
        "package.json": pkgWithScripts({
          pretscheck: "echo MARK_TSCHECK && exit 1",
          pretsc: "echo MARK_LEGACY_TSC && exit 0",
          pretypecheck: "echo MARK_LEGACY_TYPECHECK && exit 0",
        }),
        "run-run.config.mts": fixtures.config(["ts"]),
        "tsconfig.json": fixtures.tsconfig(),
        "src/ok.ts": "export const ok: number = 1;\n",
      });

      const r = cli("tsc", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      // Only `pretscheck` runs: it fails the task and the legacy aliases never fire.
      expect(r.status).not.toBe(0);
      expect(combined).toContain("MARK_TSCHECK");
      expect(combined).not.toContain("MARK_LEGACY_TSC");
      expect(combined).not.toContain("MARK_LEGACY_TYPECHECK");
    });
  });
});
