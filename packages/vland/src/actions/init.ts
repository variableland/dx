import { readdir } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { cancel, confirm, intro, isCancel, log, outro, select, spinner, text } from "@clack/prompts";
import { hasTTY, palette } from "@vlandoss/clibuddy";
import { detectPackageManager, installDependencies } from "nypm";
import type { Context } from "#src/services/ctx.ts";
import { logger } from "#src/services/logger.ts";
import { replacePlaceholders, updateRootPackageName } from "./placeholders.ts";
import { fetchTemplate, TEMPLATES, type TemplateName } from "./template.ts";

export type InitOptions = {
  name?: string;
  template?: TemplateName;
  dir?: string;
  pm?: "npm" | "pnpm" | "yarn" | "bun";
  install?: boolean;
  git?: boolean;
  force: boolean;
};

const NPM_NAME_RE = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function validateProjectName(name: string): string | undefined {
  if (!name || !name.trim()) return "Name is required.";
  if (/\s/.test(name)) return "Name cannot contain whitespace.";
  if (name.startsWith(".") || name.startsWith("/") || name.startsWith("\\")) {
    return "Name cannot start with '.', '/' or '\\'.";
  }
  if (name.includes("..")) return "Name cannot contain '..'.";
  if (!NPM_NAME_RE.test(name)) {
    return "Name must be a valid npm package name (lowercase, no spaces).";
  }
  return undefined;
}

async function isDirEmpty(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir);
    return entries.length === 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return true;
    throw error;
  }
}

async function readGitAuthor(shell: Context["shell"]): Promise<string | undefined> {
  try {
    const [name, email] = await Promise.all([
      shell.runCaptured("git", ["config", "--get", "user.name"], { throwOnError: false }),
      shell.runCaptured("git", ["config", "--get", "user.email"], { throwOnError: false }),
    ]);
    const trimmedName = name.stdout.trim();
    const trimmedEmail = email.stdout.trim();
    if (!trimmedName) return undefined;
    return trimmedEmail ? `${trimmedName} <${trimmedEmail}>` : trimmedName;
  } catch {
    return undefined;
  }
}

function abort(message: string): never {
  cancel(message);
  process.exit(1);
}

export async function runInit(ctx: Context, options: InitOptions) {
  const debug = logger.subdebug("init");
  debug("options: %O", options);

  const shell = ctx.shell;

  intro(`${palette.label(" vland init ")}`);

  // 1. Resolve template
  let template = options.template;
  if (!template) {
    if (!hasTTY) abort("Template is required in non-interactive environments. Use --template <library|backend|monorepo>.");
    const choice = await select({
      message: "Pick a template",
      options: TEMPLATES.map((value) => ({
        value,
        label: value,
      })),
    });
    if (isCancel(choice)) abort("Cancelled.");
    template = choice as TemplateName;
  }

  // 2. Resolve project name
  let name = options.name;
  if (!name) {
    if (!hasTTY) abort("Project name is required in non-interactive environments. Pass it as the first argument.");
    const value = await text({
      message: "Project name",
      placeholder: "my-app",
      validate: (input) => validateProjectName(input ?? ""),
    });
    if (isCancel(value)) abort("Cancelled.");
    name = value as string;
  }
  const nameError = validateProjectName(name);
  if (nameError) abort(nameError);

  // 3. Resolve target dir
  const dir = options.dir
    ? isAbsolute(options.dir)
      ? options.dir
      : resolve(process.cwd(), options.dir)
    : resolve(process.cwd(), name);
  debug("target dir: %s", dir);

  if (!(await isDirEmpty(dir)) && !options.force) {
    abort(`Target directory ${palette.highlight(dir)} is not empty. Re-run with ${palette.highlight("--force")} to overwrite.`);
  }

  // 4. Resolve author
  let author = await readGitAuthor(shell);
  if (!author) {
    if (!hasTTY) {
      author = "";
    } else {
      const value = await text({
        message: "Author (used in package.json / LICENSE)",
        placeholder: "Jane Doe <jane@example.com>",
        defaultValue: "",
      });
      if (isCancel(value)) abort("Cancelled.");
      author = (value as string) || "";
    }
  }
  debug("author: %s", author || "<empty>");

  // 5. Download template
  const fetchSpin = spinner();
  fetchSpin.start(`Fetching ${palette.highlight(template)} template`);
  try {
    const { source } = await fetchTemplate({ template, dir, force: options.force });
    fetchSpin.stop(`Fetched template from ${palette.muted(source)}`);
  } catch (error) {
    fetchSpin.stop("Failed to fetch template", 1);
    throw error;
  }

  // 6. Replace placeholders
  const placeholderSpin = spinner();
  placeholderSpin.start("Applying placeholders");
  await replacePlaceholders(dir, {
    projectName: name,
    author,
    year: new Date().getFullYear().toString(),
  });
  await updateRootPackageName(dir, name);
  placeholderSpin.stop("Placeholders applied");

  // 7. Resolve install / git decisions (prompt with default-yes when not set on CLI)
  const shouldInstall = await resolveYesNo(options.install, "Install dependencies?");
  const shouldGit = await resolveYesNo(options.git, "Initialise a git repository?");

  // 8. Install deps
  if (shouldInstall) {
    const detected = options.pm ?? (await detectPackageManager(dir, { ignorePackageJSON: false }))?.name ?? "pnpm";
    const installSpin = spinner();
    installSpin.start(`Installing dependencies with ${palette.highlight(detected)}`);
    try {
      await installDependencies({ cwd: dir, packageManager: { name: detected, command: detected } });
      installSpin.stop(`Installed with ${palette.highlight(detected)}`);
    } catch (error) {
      installSpin.stop("Failed to install dependencies", 1);
      log.warn("You can install manually later with `cd <dir> && <pm> install`.");
      debug("install error: %O", error);
    }
  } else {
    log.info(`Skipping ${palette.highlight("install")}.`);
  }

  // 9. Git init
  if (shouldGit) {
    const gitSpin = spinner();
    gitSpin.start("Initialising git repository");
    try {
      const gitShell = shell.at(dir).child({
        env: {
          GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME ?? "vland",
          GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL ?? "noreply@variable.land",
          GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME ?? "vland",
          GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL ?? "noreply@variable.land",
        },
      });
      await gitShell.runCaptured("git", ["init"]);
      await gitShell.runCaptured("git", ["add", "-A"]);
      await gitShell.runCaptured("git", ["commit", "-m", "chore: initial commit from vland"]);
      gitSpin.stop("Initialised git repository");
    } catch (error) {
      gitSpin.stop("Failed to initialise git", 1);
      debug("git error: %O", error);
    }
  } else {
    log.info(`Skipping ${palette.highlight("git init")}.`);
  }

  // 10. Outro with next steps
  const detectedPm = options.pm ?? (await detectPackageManager(dir, { ignorePackageJSON: false }))?.name ?? "pnpm";
  outro(
    [
      palette.success("Done!"),
      "",
      palette.muted("Next steps:"),
      `  cd ${name}`,
      shouldInstall ? `  ${detectedPm} dev` : `  ${detectedPm} install && ${detectedPm} dev`,
    ].join("\n"),
  );
}

async function resolveYesNo(explicit: boolean | undefined, message: string): Promise<boolean> {
  if (typeof explicit === "boolean") return explicit;
  if (!hasTTY) return true;
  const value = await confirm({ message, initialValue: true });
  if (isCancel(value)) abort("Cancelled.");
  return value as boolean;
}
