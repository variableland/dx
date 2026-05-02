import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const bin = resolve(import.meta.dirname, "../../bin.mjs");

test("node bin.mjs --help exits 0", () => {
  const result = spawnSync("node", [bin, "--help"], { encoding: "utf8" });

  expect(result.stderr).toBe("");
  expect(result.stdout).toContain("Usage:");
  expect(result.status).toBe(0);
});
