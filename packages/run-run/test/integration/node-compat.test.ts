import { expect, test } from "vitest";
import { createTestCli } from "#test/helpers.ts";

const cli = createTestCli();

test("node bin.mjs --help exits 0", () => {
  const result = cli("--help");

  expect(result.stderr).toBe("");
  expect(result.stdout).toContain("Usage:");
  expect(result.status).toBe(0);
});
