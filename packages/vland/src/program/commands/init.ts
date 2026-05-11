import { Argument, createCommand, Option } from "commander";
import { runInit } from "#src/actions/init.ts";
import { TEMPLATES, type TemplateName } from "#src/actions/template.ts";
import type { Context } from "#src/services/ctx.ts";
import { TOOL_LABELS } from "../ui.ts";

type InitOptions = {
  dir?: string;
  template?: TemplateName;
  pm?: "npm" | "pnpm" | "yarn" | "bun";
  install: boolean;
  git: boolean;
  force: boolean;
};

export function createInitCommand(ctx: Context) {
  return createCommand("init")
    .summary(`init a new project 🚀 (${TOOL_LABELS.GIGET})`)
    .description("Scaffold a new variableland project from one of the official templates.")
    .addArgument(new Argument("[name]", "project name (also used as the target directory)"))
    .addOption(new Option("-t, --template <name>", "template to use").choices([...TEMPLATES]))
    .addOption(new Option("-d, --dir <path>", "target directory (default: ./<name>)"))
    .addOption(new Option("--pm <manager>", "package manager to use").choices(["npm", "pnpm", "yarn", "bun"]))
    .addOption(new Option("--no-install", "skip dependency installation"))
    .addOption(new Option("--no-git", "skip git init"))
    .addOption(new Option("-f, --force", "overwrite existing directory").default(false))
    .action(async (name: string | undefined, options: InitOptions) => {
      await runInit(ctx, {
        name,
        ...options,
      });
    });
}
