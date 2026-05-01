import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const bin = resolve(import.meta.dirname, "../../dist/bin.mjs");

test("node dist/bin.mjs --help exits 0", () => {
  const result = spawnSync("node", [bin, "--help"], { encoding: "utf8" });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Usage:");
});
