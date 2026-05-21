import fs from "node:fs/promises";
import path from "node:path";
import {
  definePlugin,
  type FileOp,
  type FormatOptions,
  type Formatter,
  type InstallContext,
  type InstallResult,
  type Linter,
  type LintOptions,
  type StaticChecker,
  type StaticCheckerOptions,
  ToolService,
  type UninstallContext,
  type UninstallResult,
} from "@rrlab/cli/plugin";
import { colorize, isCI, type ShellService } from "@vlandoss/clibuddy";
import { parse as parseJsonc } from "comment-json";
import { TOOL_VERSIONS } from "./tool-versions.ts";

const FROM = import.meta.url;
const UI = colorize("#61A5FA")("biome");
const COMMON_FLAGS = ["--colors=force", "--no-errors-on-unmatched"];
const BIOME_JSON = "biome.json";
const BIOME_CONFIG_PKG = "@rrlab/biome-config";
const BIOME_SCHEMA = "https://biomejs.dev/schemas/2.4.4/schema.json";

export { TOOL_VERSIONS } from "./tool-versions.ts";

export class BiomeService extends ToolService implements Formatter, Linter, StaticChecker {
  constructor(shellService: ShellService) {
    super({ pkg: "@biomejs/biome", bin: "biome", ui: UI, shellService, from: FROM });
  }

  async format(options: FormatOptions) {
    const args = ["format", ...COMMON_FLAGS];
    if (options.fix) args.push("--fix");
    await this.exec(args);
  }

  async lint(options: LintOptions) {
    const args = ["check", ...COMMON_FLAGS, "--formatter-enabled=false"];
    if (options.fix) args.push("--fix", "--unsafe");
    await this.exec(args);
  }

  async check(options: StaticCheckerOptions): Promise<void> {
    if (options.fix) {
      await this.exec(["check", ...COMMON_FLAGS, "--fix"]);
    } else if (options.fixStaged) {
      await this.exec(["check", ...COMMON_FLAGS, "--fix", "--staged"]);
    } else {
      await this.exec([isCI ? "ci" : "check", ...COMMON_FLAGS]);
    }
  }
}

export async function install(ctx: InstallContext): Promise<InstallResult> {
  const biomeJsonPath = path.join(ctx.appPkg.dirPath, BIOME_JSON);
  const fileExists = await pathExists(biomeJsonPath);
  const scaffoldDecision = await decideScaffoldAction(ctx, fileExists);

  if (scaffoldDecision === "skip") {
    return { devDependencies: { "@biomejs/biome": TOOL_VERSIONS["@biomejs/biome"].install } };
  }

  const devDependencies: Record<string, string> = {
    "@biomejs/biome": TOOL_VERSIONS["@biomejs/biome"].install,
    [BIOME_CONFIG_PKG]: "latest",
  };

  const file: FileOp =
    scaffoldDecision === "create" || scaffoldDecision === "overwrite"
      ? {
          kind: "create",
          path: BIOME_JSON,
          content: `${JSON.stringify({ $schema: BIOME_SCHEMA, extends: [BIOME_CONFIG_PKG] }, null, 2)}\n`,
          overwrite: scaffoldDecision === "overwrite" || ctx.flags.force,
        }
      : {
          kind: "edit-json",
          path: BIOME_JSON,
          edits: [
            { op: "set", path: "/$schema", value: BIOME_SCHEMA, mode: "if-missing" },
            { op: "include", path: "/extends", value: BIOME_CONFIG_PKG, position: "start" },
          ],
        };

  return { devDependencies, files: [file] };
}

export async function uninstall(ctx: UninstallContext): Promise<UninstallResult> {
  const biomeJsonPath = path.join(ctx.appPkg.dirPath, BIOME_JSON);
  const removeDependencies = ["@biomejs/biome", BIOME_CONFIG_PKG];

  if (!(await pathExists(biomeJsonPath))) {
    return { removeDependencies };
  }

  let existing: Record<string, unknown> | undefined;
  try {
    const text = await fs.readFile(biomeJsonPath, "utf8");
    existing = parseJsonc(text) as Record<string, unknown>;
  } catch {
    /* malformed — skip surgical edits */
  }

  const files: FileOp[] = [];
  if (existing) {
    const extendsArr = Array.isArray(existing.extends) ? existing.extends : [];
    const otherExtends = extendsArr.filter((e) => e !== BIOME_CONFIG_PKG);
    const { $schema: _schema, extends: _extends, ...rest } = existing;
    const semanticKeys = Object.keys(rest);
    if (otherExtends.length === 0 && semanticKeys.length === 0) {
      files.push({ kind: "delete", path: BIOME_JSON });
    } else {
      const edits = [{ op: "exclude" as const, path: "/extends", value: BIOME_CONFIG_PKG }];
      if (otherExtends.length === 0) {
        edits.push({ op: "unset" as const, path: "/extends" } as never);
      }
      files.push({ kind: "edit-json", path: BIOME_JSON, edits });
    }
  }

  return { removeDependencies, files };
}

type ExistingFileAction = "skip" | "patch" | "overwrite";

async function decideScaffoldAction(
  ctx: InstallContext,
  fileExists: boolean,
): Promise<"create" | "patch" | "overwrite" | "skip"> {
  if (!fileExists) {
    if (ctx.flags.yes || ctx.flags.nonInteractive) return "create";
    const choice = await ctx.prompts.confirm({
      message: `Scaffold ${BIOME_JSON} with the @rrlab/biome-config preset?`,
      initialValue: true,
    });
    if (ctx.prompts.isCancel(choice)) throw new Error("Cancelled by user.");
    return choice ? "create" : "skip";
  }

  if (ctx.flags.yes || ctx.flags.nonInteractive) return "patch";

  const choice = await ctx.prompts.select<ExistingFileAction>({
    message: `${BIOME_JSON} already exists. What do you want to do?`,
    options: [
      { value: "patch", label: "Patch — add @rrlab/biome-config to extends, keep my other settings" },
      { value: "skip", label: "Skip — leave it alone" },
      { value: "overwrite", label: "Overwrite — replace with a fresh scaffold" },
    ],
    initialValue: "patch",
  });
  if (ctx.prompts.isCancel(choice)) throw new Error("Cancelled by user.");
  return choice;
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const biome = definePlugin<void>(() => ({
  name: "biome",
  apiVersion: 1,
  install,
  uninstall,
  async setup({ shell }) {
    const svc = new BiomeService(shell);
    try {
      await svc.getBinDir();
    } catch (_err) {
      throw new Error(
        "@rrlab/biome-plugin requires @biomejs/biome to be installed in the host project. " +
          "Run: rr plugins add biome  (or: pnpm add -D @biomejs/biome)",
      );
    }
    return {
      lint: svc,
      format: svc,
      jsc: svc,
    };
  },
}));

export default biome;
