import { describe, expect, test } from "vitest";
import { createTestCli } from "#test/helpers.ts";

const cli = createTestCli();

describe("rr (cli surface)", () => {
  test("--help prints usage and exits 0", () => {
    const r = cli("--help");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Usage:");
  });

  test("--version prints the semver and exits 0", () => {
    const r = cli("--version");
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  test("--about prints the credits and exits 0", () => {
    const r = cli("--about");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Inspired by:");
  });

  test("--usage prints the KDL spec and exits 0", () => {
    const r = cli("--usage");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("name rr");
  });

  // Unknown commands use commander's native error + suggestion (showSuggestionAfterError).
  test("a near-miss command errors and suggests the closest match", () => {
    const r = cli("lnit");
    expect(r.status).not.toBe(0);
    const combined = r.stdout + r.stderr;
    expect(combined).toContain("unknown command 'lnit'");
    expect(combined).toContain("Did you mean");
    expect(combined).toContain("lint");
  });

  test("a far-off command errors with no suggestion", () => {
    const r = cli("zzzzzz");
    expect(r.status).not.toBe(0);
    const combined = r.stdout + r.stderr;
    expect(combined).toContain("unknown command 'zzzzzz'");
    expect(combined).not.toContain("Did you mean");
  });
});
