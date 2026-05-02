import { expect, test } from "vitest";
import { createTestCli } from "#test/helpers.ts";

const cli = createTestCli();

test("jsc doctor: exits 0 and reports biome ok", () => {
  const result = cli("jsc doctor");

  expect(result.stderr).toBe("");
  expect(result.stdout).toContain("biome ok");
  expect(result.status).toBe(0);
});

test("tsc doctor: exits 0 and reports tsc ok", () => {
  const result = cli("tsc doctor");

  expect(result.stderr).toBe("");
  expect(result.stdout).toContain("tsc ok");
  expect(result.status).toBe(0);
});

test("lint doctor: exits 0 and reports biome ok", () => {
  const result = cli("lint doctor");

  expect(result.stderr).toBe("");
  expect(result.stdout).toContain("biome ok");
  expect(result.status).toBe(0);
});

test("format doctor: exits 0 and reports biome ok", () => {
  const result = cli("format doctor");

  expect(result.stderr).toBe("");
  expect(result.stdout).toContain("biome ok");
  expect(result.status).toBe(0);
});

test("build:lib doctor: exits 0 and reports tsdown ok", () => {
  const result = cli("build:lib doctor");

  expect(result.stderr).toBe("");
  expect(result.stdout).toContain("tsdown ok");
  expect(result.status).toBe(0);
});
