import { describe, expect, test } from "vitest";
import { InvalidPluginModuleError } from "#src/errors/invalid-plugin-module.ts";
import { KnownError } from "#src/errors/known-error.ts";
import { MissingPluginError } from "#src/errors/missing-plugin.ts";
import { PluginApiVersionError } from "#src/errors/plugin-api-version.ts";
import { UnknownPluginError } from "#src/errors/unknown-plugin.ts";
import { MultipleProvidersError } from "#src/lib/plugin/errors.ts";

// Every user-facing domain error must extend KnownError so the top-level
// handler renders it as a clean message instead of a raw stack trace.
const domainErrors = [
  new MissingPluginError("pack"),
  new UnknownPluginError("nope"),
  new PluginApiVersionError("biome", 2),
  new InvalidPluginModuleError("@rrlab/biome-plugin"),
  new MultipleProvidersError("lint", ["biome", "oxc"]),
];

describe("KnownError", () => {
  test.each(domainErrors)("$constructor.name is a KnownError and an Error", (error) => {
    expect(error).toBeInstanceOf(KnownError);
    expect(error).toBeInstanceOf(Error);
  });
});
