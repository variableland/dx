import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export { existsSync as pathExists };

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..", "..");
const TEMPLATES_DIR = path.join(REPO_ROOT, "vland", "templates");
const VLAND_BIN = path.join(REPO_ROOT, "vland", "cli", "bin");

type CliMode = "dev" | "prod";

type CliOptions = {
  cwd?: string;
};

export function createTestCli(mode: CliMode = "prod") {
  return function cli(cmd: string, opts: CliOptions = {}) {
    return spawnSync(VLAND_BIN, cmd.split(" ").filter(Boolean), {
      encoding: "utf8",
      cwd: opts.cwd,
      env:
        mode === "dev"
          ? { ...process.env, VLAND_TEMPLATES_DIR: TEMPLATES_DIR }
          : {
              ...process.env,
              NODE_ENV: "production",
              TEST: undefined,
              NO_COLOR: "1",
              VLAND_TEMPLATES_DIR: TEMPLATES_DIR,
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
