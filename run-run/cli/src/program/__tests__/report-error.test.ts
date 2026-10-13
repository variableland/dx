import { afterEach, describe, expect, test, vi } from "vitest";
import { MissingPluginError } from "#src/errors/missing-plugin.ts";
import { logger } from "#src/services/logger.ts";
import { reportError } from "../report-error.ts";

describe("reportError", () => {
  afterEach(() => vi.restoreAllMocks());

  test("a KnownError is rendered as its message, without a stack trace", () => {
    let rendered: unknown;
    const spy = vi.spyOn(logger, "error").mockImplementation((arg) => {
      rendered = arg;
    });

    reportError(new MissingPluginError("pack"));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(rendered)).toContain("No plugin provides the 'pack' capability.");
    expect(String(rendered)).not.toMatch(/\n\s+at /); // no stack frames leaked in
  });

  test("an unexpected error surfaces its stack so it can be reported", () => {
    let rendered: unknown;
    const spy = vi.spyOn(logger, "error").mockImplementation((arg) => {
      rendered = arg;
    });

    reportError(new Error("kaboom"));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(rendered)).toContain("kaboom");
    expect(String(rendered)).toMatch(/\n\s+at /); // the stack is preserved
  });
});
