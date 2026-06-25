import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { dirnameOf } from "@vlandoss/clibuddy";
import { describe, expect, it } from "vitest";

const HERE = dirnameOf(import.meta);
const RUN_RUN = path.resolve(HERE, "../../..");

const PLUGIN_DIRS = [
  path.resolve(RUN_RUN, "biome-plugin/src"),
  path.resolve(RUN_RUN, "oxc-plugin/src"),
  path.resolve(RUN_RUN, "ts-plugin/src"),
  path.resolve(RUN_RUN, "tsdown-plugin/src"),
  path.resolve(RUN_RUN, "vitest-plugin/src"),
] as const;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "__tests__") continue; // tests have permission to do whatever
    const abs = path.join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) out.push(...walk(abs));
    else if (entry.endsWith(".ts")) out.push(abs);
  }
  return out;
}

const PROMPT_USAGE = /\bctx\.prompts\b/;
const CLACK_IMPORT = /from\s+["']@clack\/prompts["']/;

describe("plugin discipline", () => {
  it("no plugin source file accesses ctx.prompts directly", () => {
    const violations: string[] = [];
    for (const dir of PLUGIN_DIRS) {
      for (const file of walk(dir)) {
        const src = readFileSync(file, "utf8");
        if (PROMPT_USAGE.test(src)) violations.push(path.relative(RUN_RUN, file));
      }
    }
    expect(
      violations,
      `Plugins must not call ctx.prompts directly — route through @rrlab/cli/plugin helpers (decideScaffold, pickPreset). Offenders: ${violations.join(", ")}`,
    ).toEqual([]);
  });

  it("no plugin source file imports @clack/prompts directly", () => {
    const violations: string[] = [];
    for (const dir of PLUGIN_DIRS) {
      for (const file of walk(dir)) {
        const src = readFileSync(file, "utf8");
        if (CLACK_IMPORT.test(src)) violations.push(path.relative(RUN_RUN, file));
      }
    }
    expect(violations, `Plugins must not import @clack/prompts directly. Offenders: ${violations.join(", ")}`).toEqual([]);
  });
});
