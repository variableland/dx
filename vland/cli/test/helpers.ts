import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export { existsSync as pathExists };

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..", "..");
export const TEMPLATES_DIR = path.join(REPO_ROOT, "vland", "templates");
const VLAND_BIN = path.join(REPO_ROOT, "vland", "cli", "bin");

type CliMode = "dev" | "prod";

type CliOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

export function createTestCli(mode: CliMode = "prod") {
  return function cli(cmd: string, opts: CliOptions = {}) {
    return spawnSync(VLAND_BIN, cmd.split(" ").filter(Boolean), {
      encoding: "utf8",
      cwd: opts.cwd,
      env:
        mode === "dev"
          ? { ...process.env, VLAND_TEMPLATES_DIR: TEMPLATES_DIR, ...opts.env }
          : {
              ...process.env,
              NODE_ENV: "production",
              TEST: undefined,
              NO_COLOR: "1",
              VLAND_TEMPLATES_DIR: TEMPLATES_DIR,
              ...opts.env,
            },
    });
  };
}

export function makeTmpDir(name: string): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(path.join(tmpdir(), `vland-${name}-`));
  return {
    dir,
    cleanup: () => {
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

export function gitOutput(cwd: string, args: string[]): string {
  return spawnSync("git", args, { cwd, encoding: "utf8" }).stdout.trim();
}

const WORKSPACE_BIN = path.join(REPO_ROOT, "node_modules", ".bin");

/** Runs the workspace's `oxfmt --check` over the project in `cwd`. */
export function oxfmtCheck(cwd: string) {
  return spawnSync(path.join(WORKSPACE_BIN, "oxfmt"), ["--check"], { cwd, encoding: "utf8" });
}

/**
 * Runs the workspace's `biome check` over the project in `cwd`, set up the way
 * `rr plugins add biome` sets it up: a biome.json that extends
 * `@rrlab/biome-config`, resolved through a symlink to the workspace's
 * node_modules.
 */
export function biomeCheck(cwd: string) {
  writeFileSync(
    path.join(cwd, "biome.json"),
    `{\n  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",\n  "extends": ["@rrlab/biome-config"]\n}\n`,
  );
  symlinkSync(path.join(REPO_ROOT, "node_modules"), path.join(cwd, "node_modules"), "dir");
  return spawnSync(path.join(WORKSPACE_BIN, "biome"), ["check"], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

/**
 * Runs `mise install --locked --dry-run` in the project in `cwd`: the install
 * the generated CI's mise-action runs when the project has a mise.lock. mise
 * runs offline, with empty data, cache and state dirs, and without the
 * machine's global config, system config, MISE_ENV or any config above `cwd`,
 * so it reads only the project's mise.toml and mise.lock.
 */
export function miseLockedCheck(cwd: string) {
  const home = mkdtempSync(path.join(tmpdir(), "vland-mise-"));
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^_*MISE_/.test(key)));
  try {
    return spawnSync("mise", ["install", "--locked", "--dry-run"], {
      cwd,
      encoding: "utf8",
      env: {
        ...env,
        NO_COLOR: "1",
        MISE_OFFLINE: "1",
        MISE_DATA_DIR: path.join(home, "data"),
        MISE_CACHE_DIR: path.join(home, "cache"),
        MISE_STATE_DIR: path.join(home, "state"),
        MISE_CONFIG_DIR: path.join(home, "config"),
        MISE_GLOBAL_CONFIG_FILE: path.join(home, "config", "config.toml"),
        MISE_SYSTEM_CONFIG_FILE: path.join(home, "system", "config.toml"),
        MISE_CEILING_PATHS: path.dirname(cwd),
        MISE_TRUSTED_CONFIG_PATHS: cwd,
      },
    });
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}
