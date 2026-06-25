import { afterEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

const PASSING_TEST = `import { expect, test } from "vitest";\ntest("passes", () => { expect(1).toBe(1); });\n`;
const FAILING_TEST = `import { expect, test } from "vitest";\ntest("fails", () => { expect(1).toBe(2); });\n`;
const ENV_TEST = `import { expect, test } from "vitest";\ntest("reads env", () => { expect(process.env.RR_TEST_VAR).toBe("from-env-test"); });\n`;

describe("rr test", () => {
  let fixture: { dir: string; cleanup: () => void };

  afterEach(() => fixture?.cleanup());

  test("forwards `run` and exits 0 when the suite passes", () => {
    fixture = makeFixture("test-pass", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["vitest"]),
      "src/ok.test.ts": PASSING_TEST,
    });
    const r = cli("test run", { cwd: fixture.dir });
    expect(r.status).toBe(0);
  });

  test("exits non-zero when the suite fails", () => {
    fixture = makeFixture("test-fail", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["vitest"]),
      "src/bad.test.ts": FAILING_TEST,
    });
    const r = cli("test run", { cwd: fixture.dir });
    expect(r.status).not.toBe(0);
  });

  test("loads .env.test by default", () => {
    fixture = makeFixture("test-env-default", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["vitest"]),
      ".env.test": "RR_TEST_VAR=from-env-test\n",
      "src/env.test.ts": ENV_TEST,
    });
    const r = cli("test run", { cwd: fixture.dir });
    expect(r.status).toBe(0);
  });

  test("loads the file named by --env, overriding the defaults", () => {
    fixture = makeFixture("test-env-override", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["vitest"]),
      // A default that would set the WRONG value, plus the override with the right one.
      ".env.test": "RR_TEST_VAR=from-default\n",
      ".env.ci": "RR_TEST_VAR=from-env-test\n",
      "src/env.test.ts": ENV_TEST,
    });
    const r = cli("test --env=.env.ci run", { cwd: fixture.dir });
    expect(r.status).toBe(0);
  });

  test("errors when an explicit --env file is missing", () => {
    fixture = makeFixture("test-env-missing", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["vitest"]),
      "src/ok.test.ts": PASSING_TEST,
    });
    const r = cli("test --env=.env.nope run", { cwd: fixture.dir });
    expect(r.stderr + r.stdout).toMatch(/env file not found: \.env\.nope/);
    expect(r.status).not.toBe(0);
  });

  test("forwards --help to vitest instead of showing rr's help", () => {
    fixture = makeFixture("test-help", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["vitest"]),
      "src/ok.test.ts": PASSING_TEST,
    });
    const r = cli("test --help", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;
    expect(combined).toContain("vitest");
    expect(combined).toMatch(/Usage:/);
    expect(combined).not.toMatch(/Powered by:/); // not rr's command help
    expect(r.status).toBe(0);
  });

  test("doctor reports vitest healthy", () => {
    fixture = makeFixture("test-doctor", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["vitest"]),
    });
    const r = cli("test doctor", { cwd: fixture.dir });
    expect(r.stdout + r.stderr).toContain("vitest");
    expect(r.status).toBe(0);
  });

  test("hints `rr plugins add vitest` when no test provider is configured", () => {
    fixture = makeFixture("test-missing-plugin", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config(["ts"]),
      "src/ok.test.ts": PASSING_TEST,
    });
    const r = cli("test run", { cwd: fixture.dir });
    expect(r.stderr + r.stdout).toMatch(/rr plugins add vitest/);
    expect(r.status).not.toBe(0);
  });
});
