import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TOOL_VERSIONS } from "../tool-versions.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.resolve(here, "../../package.json"), "utf8")) as {
  peerDependencies?: Record<string, string>;
};

describe("TOOL_VERSIONS coherence with this plugin's package.json", () => {
  for (const [name, entry] of Object.entries(TOOL_VERSIONS) as Array<[string, { install: string; peer?: string }]>) {
    const expected = entry.peer;
    if (!expected) continue;
    it(`${name}: peer range matches package.json`, () => {
      expect(pkg.peerDependencies?.[name]).toBe(expected);
    });
  }
});
