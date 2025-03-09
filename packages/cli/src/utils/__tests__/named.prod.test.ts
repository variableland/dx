import { afterAll, beforeAll, expect, test, vi } from "vitest";

beforeAll(() => {
  vi.stubEnv("ENV", "prod");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

test.each([
  { arg: "rr", expected: "rr" },
  { arg: "anyother", expected: "anyother" },
])("named($arg) -> $expected", async ({ arg, expected }) => {
  const { named } = await import("~/utils/named");
  expect(named(arg)).toBe(expected);
});
