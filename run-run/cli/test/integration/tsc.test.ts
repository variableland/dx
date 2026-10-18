import path from "node:path";
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

  describe("doctor in a pnpm workspace", () => {
    const workspace = (plugin: "ts" | "astro", packages: Record<string, string>) =>
      makeFixture(`tsc-doctor-${plugin}-workspace`, {
        "package.json": fixtures.pkg(),
        "pnpm-workspace.yaml": "packages:\n  - packages/*\n",
        "run-run.config.mts": fixtures.config([plugin]),
        ...packages,
      });

    const tsPackage = (name: string) => ({
      [`packages/${name}/package.json`]: fixtures.pkg(name),
      [`packages/${name}/tsconfig.json`]: fixtures.tsconfig(),
      [`packages/${name}/src/ok.ts`]: "export const ok: number = 1;\n",
    });

    test("checks the packages `rr tsc` checks, one row each, and not the workspace root", () => {
      fixture = workspace("ts", {
        ...tsPackage("a"),
        ...tsPackage("b"),
        // No tsconfig.json: `rr tsc` skips it, so doctor does too.
        "packages/c/package.json": fixtures.pkg("c"),
      });
      const r = cli("tsc doctor", { cwd: fixture.dir });
      const combined = r.stdout + r.stderr;
      expect(combined).toContain("doctor (tsc) · 2 packages");
      expect(combined).toMatch(/✔ a\b/);
      expect(combined).toMatch(/✔ b\b/);
      expect(combined).not.toMatch(/[✔✖] c\b/);
      expect(combined).not.toContain("rr-test-fixture");
      expect(r.status).toBe(0);
    });

    test("from inside a package, checks that package alone", () => {
      fixture = workspace("ts", { ...tsPackage("a"), ...tsPackage("b") });
      const r = cli("tsc doctor", { cwd: path.join(fixture.dir, "packages/a") });
      const combined = r.stdout + r.stderr;
      expect(combined).toContain("doctor (tsc) · a");
      expect(combined).not.toMatch(/· \d+ packages/);
      expect(r.status).toBe(0);
    });

    test("checks each package with the tool `rr tsc` runs there, and fails for the one that can't run it", () => {
      // astro: `site` is an Astro package missing @astrojs/check; `lib` is plain TS, checked with tsc.
      fixture = workspace("astro", {
        "packages/site/package.json": `${JSON.stringify({ name: "site", private: true, dependencies: { astro: "^7.0.0" } })}\n`,
        "packages/site/tsconfig.json": fixtures.tsconfig(),
        ...tsPackage("lib"),
      });
      // pnpm's bin shim puts its virtual store on NODE_PATH, where @astrojs/check resolves from anywhere.
      const r = cli("tsc doctor", { cwd: fixture.dir, env: { NODE_PATH: undefined } });
      const combined = r.stdout + r.stderr;
      expect(combined).toContain("doctor (astro) · 2 packages");
      expect(combined).toMatch(/✖ site\b/);
      expect(combined).toContain("requires @astrojs/check to be installed");
      expect(combined).toMatch(/✔ lib\b/);
      expect(r.status).toBe(1);
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

  describe.each([
    ["settings-only", "minimumReleaseAge: 1440\n"],
    ["root-only", "packages:\n  - .\nminimumReleaseAge: 1440\n"],
  ])("%s pnpm-workspace.yaml", (_, pnpmWorkspace) => {
    beforeEach(() => {
      fixture = makeFixture("tsc-pnpm-settings", {
        "package.json": fixtures.pkg(),
        "pnpm-workspace.yaml": pnpmWorkspace,
        "run-run.config.mts": fixtures.config(["ts"]),
        "tsconfig.json": fixtures.tsconfig(),
        "src/bad.ts": 'export const bad: number = "not a number";\n',
      });
    });

    test("typechecks the root package as a single package", () => {
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
