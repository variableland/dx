import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const bin = resolve(import.meta.dirname, "../../dist/bin.mjs");
const content = readFileSync(bin, "utf8");

test("dist/bin.mjs has no CJS globals", () => {
  expect(content).not.toContain("__dirname");
  expect(content).not.toContain("__filename");
});
