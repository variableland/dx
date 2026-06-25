import fs from "node:fs/promises";
import path from "node:path";
import {
  definePlugin,
  type InstallContext,
  type InstallResult,
  type TestRunOptions,
  ToolService,
  type UninstallContext,
  type UninstallResult,
} from "@rrlab/cli/plugin";
import { colorize, type ShellService } from "@vlandoss/clibuddy";
import { TOOL_VERSIONS } from "./tool-versions.ts";

export { TOOL_VERSIONS } from "./tool-versions.ts";

const FROM = import.meta.url;
// Default env files, in order of preference — first existing wins.
const DEFAULT_ENV_FILES = [".env.test", ".env"] as const;
const vitestColor = colorize("#729B1B");

export class VitestService extends ToolService {
  #cwd: string;

  constructor(shellService: ShellService, cwd: string) {
    super({ bin: "vitest", color: vitestColor, shellService, from: FROM });
    this.#cwd = cwd;
  }

  async test({ envFile, args }: TestRunOptions): Promise<number> {
    const resolved = await resolveEnvFile(this.#cwd, envFile);
    const bin = await this.getBinDir();
    // Spawn `node [--env-file=<file>] <vitest-bin> <args>`: wrapping with node
    // is how the env file is loaded (the user's original `node --env-file-…`
    // script), and streaming keeps watch mode / colors / --help intact.
    const nodeArgs = resolved ? [`--env-file=${resolved}`, bin, ...args] : [bin, ...args];
    return this.runStreamed(process.execPath, nodeArgs);
  }
}

/**
 * Resolves which env file vitest should load.
 *
 * - An explicit `override` (`--env-file`) is an assertion the file exists: it's
 *   resolved against `cwd` and we throw if it's missing (typo protection),
 *   rather than silently running with the wrong environment.
 * - With no override, the first existing of `.env.test`, then `.env` wins;
 *   `null` when neither exists, so vitest runs with no env file.
 */
export async function resolveEnvFile(cwd: string, override?: string): Promise<string | null> {
  if (override) {
    const abs = path.resolve(cwd, override);
    if (await exists(abs)) return abs;
    throw new Error(`env file not found: ${override}`);
  }

  for (const name of DEFAULT_ENV_FILES) {
    const abs = path.resolve(cwd, name);
    if (await exists(abs)) return abs;
  }

  return null;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Pure passthrough: no config scaffolding, just make sure the peer is present.
export function install(_ctx: InstallContext): Promise<InstallResult> {
  return Promise.resolve({ devDependencies: { vitest: TOOL_VERSIONS.vitest.install } });
}

export function uninstall(_ctx: UninstallContext): Promise<UninstallResult> {
  return Promise.resolve({ removeDependencies: ["vitest"] });
}

const vitest = definePlugin({
  apiVersion: 1,
  name: "vitest",
  color: vitestColor,
  install,
  uninstall,
  services: ({ shell, cwd }) => ({ test: new VitestService(shell, cwd) }),
});

export default vitest;
