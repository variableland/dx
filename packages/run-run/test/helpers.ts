import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path, { resolve } from "node:path";
import { dirnameOf } from "@vlandoss/clibuddy";

const BIN = resolve(dirnameOf(import.meta), "../bin");

type CliMode = "dev" | "prod";

type CliOptions = {
  cwd?: string;
};

export function createTestCli(mode: CliMode = "prod") {
  return function cli(cmd: string, opts: CliOptions = {}) {
    return spawnSync(BIN, cmd.split(" ").filter(Boolean), {
      encoding: "utf8",
      cwd: opts.cwd,
      env:
        mode === "dev"
          ? process.env
          : {
              ...process.env,
              NODE_ENV: "production",
              TEST: undefined,
              NO_COLOR: "1",
            },
    });
  };
}

type FixtureFiles = Record<string, string>;

export function makeFixture(name: string, files: FixtureFiles): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(path.join(tmpdir(), `rr-${name}-`));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
  return {
    dir,
    cleanup: () => {
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

export const fixtures = {
  pkg: (name = "rr-test-fixture") => `${JSON.stringify({ name, version: "0.0.0", private: true }, null, 2)}\n`,
  biomeNoop: () =>
    `${JSON.stringify({ formatter: { enabled: false }, linter: { enabled: false }, assist: { enabled: false } }, null, 2)}\n`,
  tsconfig: () =>
    `${JSON.stringify({ compilerOptions: { target: "es2020", module: "esnext", moduleResolution: "bundler", strict: true, noEmit: true, skipLibCheck: true } }, null, 2)}\n`,
};
