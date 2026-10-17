import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { dirnameOf } from "@variablelab/clibuddy";
import { describe, expect, it } from "vitest";
import { PLUGINS_DIRECTORY } from "#src/lib/plugin/directory.ts";

const HERE = dirnameOf(import.meta);
const RUN_RUN = path.resolve(HERE, "../../..");

// Read from disk, so a new plugin is scanned without editing this file.
const PLUGIN_PACKAGES = readdirSync(RUN_RUN).filter((entry) => entry.endsWith("-plugin"));
const PLUGIN_DIRS = PLUGIN_PACKAGES.map((entry) => path.resolve(RUN_RUN, entry, "src"));

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
  it("every run-run/*-plugin package is an official plugin in PLUGINS_DIRECTORY, and vice versa", () => {
    const official = Object.values(PLUGINS_DIRECTORY).map((info) => info.pkg.replace("@rrlab/", ""));
    expect([...PLUGIN_PACKAGES].sort()).toEqual(official.sort());
  });

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
