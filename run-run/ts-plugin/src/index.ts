import fs from "node:fs/promises";
import path from "node:path";
import {
  decideScaffold,
  definePlugin,
  type FileOp,
  type InstallContext,
  type InstallResult,
  pickPreset,
  ToolService,
  type TypeChecker,
  type TypeCheckOptions,
  type UninstallContext,
  type UninstallResult,
} from "@rrlab/cli/plugin";
import { colorize, type ShellService } from "@vlandoss/clibuddy";
import { parse as parseJsonc } from "comment-json";
import { TOOL_VERSIONS } from "./tool-versions.ts";

export { TOOL_VERSIONS } from "./tool-versions.ts";

const FROM = import.meta.url;
const UI = colorize("#3178C6")("tsc");
const TSCONFIG = "tsconfig.json";

export class TscService extends ToolService implements TypeChecker {
  constructor(shellService: ShellService) {
    super({ pkg: "typescript", bin: "tsc", ui: UI, shellService, from: FROM });
  }

  async check(options: TypeCheckOptions = {}): Promise<void> {
    await this.exec(["--noEmit"], { cwd: options.cwd, verbose: !options.cwd });
  }
}

type Preset = "react" | "dom-app" | "dom-lib" | "no-dom-app" | "no-dom-lib";

type PresetInfo = {
  extendsPath: string;
  label: string;
  /** `@types/node` is only required by the no-dom presets. */
  needsNode: boolean;
};

const PRESETS: Record<Preset, PresetInfo> = {
  react: { extendsPath: "@rrlab/ts-config/react", label: "React app", needsNode: false },
  "dom-app": { extendsPath: "@rrlab/ts-config/dom/app", label: "Web app (DOM, no React)", needsNode: false },
  "dom-lib": { extendsPath: "@rrlab/ts-config/dom/lib", label: "Browser library", needsNode: false },
  "no-dom-app": { extendsPath: "@rrlab/ts-config/no-dom/app", label: "Node.js app / CLI", needsNode: true },
  "no-dom-lib": { extendsPath: "@rrlab/ts-config/no-dom/lib", label: "Node.js library", needsNode: true },
};

const DEFAULT_PRESET: Preset = "no-dom-app";

export async function install(ctx: InstallContext): Promise<InstallResult> {
  const tsconfigPath = path.join(ctx.appPkg.dirPath, TSCONFIG);
  const fileExists = await pathExists(tsconfigPath);
  const scaffoldDecision = await decideScaffold(ctx, {
    label: TSCONFIG,
    fileExists,
    patchHint: "update extends, keep my other settings",
  });

  if (scaffoldDecision === "skip") {
    return { devDependencies: { typescript: TOOL_VERSIONS.typescript.install } };
  }

  const preset = await pickPreset(ctx, {
    message: "Which kind of TS project do you need?",
    presets: PRESETS,
    defaultPreset: DEFAULT_PRESET,
  });
  const presetInfo = PRESETS[preset];

  const devDependencies: Record<string, string> = {
    typescript: TOOL_VERSIONS.typescript.install,
    "@rrlab/ts-config": await ctx.release.resolve("@rrlab/ts-config"),
  };
  if (presetInfo.needsNode) devDependencies["@types/node"] = TOOL_VERSIONS["@types/node"].install;

  const wrapper = { extends: presetInfo.extendsPath };
  const file: FileOp =
    scaffoldDecision === "create" || scaffoldDecision === "overwrite"
      ? {
          kind: "create",
          path: TSCONFIG,
          content: `${JSON.stringify(wrapper, null, 2)}\n`,
          overwrite: scaffoldDecision === "overwrite" || ctx.flags.force,
        }
      : {
          kind: "edit-json",
          path: TSCONFIG,
          edits: [{ op: "set", path: "/extends", value: presetInfo.extendsPath, mode: "replace" }],
        };

  return { devDependencies, files: [file] };
}

export async function uninstall(ctx: UninstallContext): Promise<UninstallResult> {
  const tsconfigPath = path.join(ctx.appPkg.dirPath, TSCONFIG);
  const removeDependencies = ["typescript", "@rrlab/ts-config", "@types/node"];

  if (!(await pathExists(tsconfigPath))) {
    return { removeDependencies };
  }

  let existing: Record<string, unknown> | undefined;
  try {
    const text = await fs.readFile(tsconfigPath, "utf8");
    existing = parseJsonc(text) as Record<string, unknown>;
  } catch {
    /* malformed — leave it alone, only edit if we can parse */
  }

  const files: FileOp[] = [];
  if (existing) {
    const { extends: _drop, ...rest } = existing;
    const semanticKeys = Object.keys(rest).filter((k) => !k.startsWith("$"));
    if (semanticKeys.length === 0) {
      files.push({ kind: "delete", path: TSCONFIG });
    } else {
      files.push({ kind: "edit-json", path: TSCONFIG, edits: [{ op: "unset", path: "/extends" }] });
    }
  }

  return { removeDependencies, files };
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const ts = definePlugin(() => ({
  name: "ts",
  apiVersion: 1,
  install,
  uninstall,
  capabilities: ({ shell }) => ({ tsc: new TscService(shell) }),
}));

export default ts;
