import { describe, expect, test } from "vitest";
import { createTestCli } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr (cli surface)", () => {
  test("--help prints usage and exits 0", () => {
    const r = cli("--help");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Usage:");
  });

  test("--version prints a semver-shaped string", () => {
    const r = cli("--version");
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  test("an unknown command exits non-zero", () => {
    const r = cli("definitely-not-a-real-command");
    expect(r.status).not.toBe(0);
  });
});
