import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, fixtures, makeFixture } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr (error rendering)", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    // A valid config that configures no plugins: invoking a plugin-backed
    // command raises MissingPluginError, the canonical user-facing domain error.
    fixture = makeFixture("errors", {
      "package.json": fixtures.pkg(),
      "run-run.config.mts": fixtures.config([]),
    });
  });

  afterEach(() => fixture.cleanup());

  test("a missing-plugin error prints its message, not a raw stack trace", () => {
    const r = cli("pack", { cwd: fixture.dir });
    const combined = r.stdout + r.stderr;

    // The helpful guidance the error carries is still shown.
    expect(combined).toContain("No plugin provides the 'pack' capability.");
    expect(combined).toContain("rr plugins add tsdown");

    // ...but none of the verbose Node uncaught-exception noise.
    expect(combined).not.toContain("at PluginRegistry");
    expect(combined).not.toMatch(/registry\.ts:\d+/);
    expect(combined).not.toContain("Node.js v");

    expect(r.status).toBe(1);
  });
});
