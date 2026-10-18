import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import {
  type DoctorOptions,
  definePlugin,
  type InstallContext,
  type InstallResult,
  type RunReport,
  ToolService,
  type TypeChecker,
  type TypeCheckOptions,
  type UninstallContext,
  type UninstallResult,
} from "@rrlab/cli/plugin";
import { colorize, type ShellService } from "@variablelab/clibuddy";
import { TOOL_VERSIONS } from "./tool-versions.ts";

export { TOOL_VERSIONS } from "./tool-versions.ts";

const FROM = import.meta.url;
const localRequire = createRequire(FROM);
// What `astro check` loads from the project root before checking anything.
const CHECK_DEPS = ["@astrojs/check", "typescript"] as const;
// What a package without Astro is checked with instead.
const TSC_DEPS = ["typescript"] as const;
// astro 7 looks for the first four; astro 5, the peer floor, also loads a CommonJS config.
const CONFIG_FILES = ["mjs", "js", "ts", "mts", "cjs", "cts"].map((ext) => `astro.config.${ext}`);
const astroColor = colorize("#BC52EE");

/**
 * The `typecheck` provider. In a monorepo `rr tsc` hands it every package with
 * a `tsconfig.json`, and no second provider can cover the ones without Astro,
 * so each package gets the checker that fits it: `astro check` in an Astro
 * package, `tsc --noEmit` in any other. Run there, `astro check` would boot
 * Astro, warn about Vite and write `.astro/` into the package.
 */
export class AstroCheckService extends ToolService implements TypeChecker {
  #cwd: string;
  #tsc: ToolService;

  constructor(shellService: ShellService, cwd: string) {
    super({ bin: "astro", color: astroColor, shellService, from: FROM });
    this.#cwd = cwd;
    this.#tsc = new ToolService({ pkg: "typescript", bin: "tsc", color: astroColor, shellService, from: FROM });
  }

  async check(options: TypeCheckOptions = {}): Promise<RunReport> {
    const cwd = options.cwd ?? this.#cwd;
    const { astro, missing } = await checkerAt(cwd);
    if (missing.length > 0) return missingDepsReport(missing);
    // `--pretty` forces color + formatting even when captured (tsc otherwise
    // drops color off a TTY); see decisions/013.
    if (!astro) return this.#tsc.runReport(["--noEmit", "--pretty"], { cwd });
    // `astro check`, not @astrojs/check's own `astro-check` bin: only the
    // former runs `astro sync` first, so generated types (content collections,
    // `astro:env`, …) exist. Its diagnostics keep their color when captured.
    return this.runReport(["check"], { cwd });
  }

  override async doctor(options: DoctorOptions = {}): Promise<RunReport> {
    const cwd = options.cwd ?? this.#cwd;
    const { astro, missing } = await checkerAt(cwd);
    if (missing.length > 0) return missingDepsReport(missing);
    return astro ? super.doctor({ cwd }) : this.#tsc.doctor({ cwd });
  }
}

/**
 * Picks the checker for the package at `dir`, `astro check` in an Astro
 * package and `tsc` in any other, and lists what that checker needs but can't
 * resolve there.
 */
async function checkerAt(dir: string): Promise<{ astro: boolean; missing: string[] }> {
  const astro = await isAstroProject(dir);
  return { astro, missing: missingCheckDeps(dir, astro ? CHECK_DEPS : TSC_DEPS) };
}

/**
 * Whether the package at `dir` is an Astro project: it has an `astro.config.*`,
 * or `astro` in its `dependencies`, `devDependencies` or `peerDependencies`.
 * Either is enough. An app whose `astro` is hoisted to the workspace root has
 * only the config, and a component library has only the dependency, since
 * Astro needs a config file only when there is something to configure.
 */
export async function isAstroProject(dir: string): Promise<boolean> {
  const configs = await Promise.all(CONFIG_FILES.map((name) => pathExists(path.join(dir, name))));
  if (configs.some(Boolean)) return true;
  const { dependencies, devDependencies, peerDependencies } = await readManifest(dir);
  return [dependencies, devDependencies, peerDependencies].some((deps) => isRecord(deps) && "astro" in deps);
}

/**
 * The package's own `package.json`, or `{}` when it has none or it doesn't
 * parse. Not the nearest one up the tree: an `astro` dependency of the
 * workspace root doesn't make every package under it an Astro package.
 */
async function readManifest(dir: string): Promise<Record<string, unknown>> {
  try {
    const manifest: unknown = JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8"));
    return isRecord(manifest) ? manifest : {};
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Lists the `deps` the project at `root` can't resolve, looking them up the way
 * astro does (`require.resolve(pkg, { paths: [root] })`). When one `astro check`
 * needs is missing, astro prompts to install it instead of checking: under a
 * captured run that prompt hangs, and with stdin closed astro exits 0 having
 * checked nothing. So we fail before running it, and name what is missing.
 */
export function missingCheckDeps(root: string, deps: readonly string[] = CHECK_DEPS): string[] {
  return deps.filter((pkg) => {
    try {
      localRequire.resolve(pkg, { paths: [root] });
      return false;
    } catch {
      return true;
    }
  });
}

function missingDepsReport(missing: string[]): RunReport {
  return {
    ok: false,
    output:
      `@rrlab/astro-plugin requires ${missing.join(", ")} to be installed in the host project. ` +
      `Run: rr plugins add astro  (or: pnpm add -D ${missing.join(" ")})`,
  };
}

// No config scaffolding: an Astro project already has its tsconfig.json, and
// `astro` itself is the host's own dependency, so only the checker is added.
export async function install(_ctx: InstallContext): Promise<InstallResult> {
  return {
    devDependencies: {
      "@astrojs/check": TOOL_VERSIONS["@astrojs/check"].install,
      typescript: TOOL_VERSIONS.typescript.install,
    },
  };
}

export async function uninstall(_ctx: UninstallContext): Promise<UninstallResult> {
  return { removeDependencies: ["@astrojs/check", "typescript"] };
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const astro = definePlugin({
  apiVersion: 1,
  name: "astro",
  color: astroColor,
  install,
  uninstall,
  services: ({ shell, cwd }) => ({ typecheck: new AstroCheckService(shell, cwd) }),
});

export default astro;
