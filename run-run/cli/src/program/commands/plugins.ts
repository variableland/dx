import fs from "node:fs/promises";
import path from "node:path";
import * as clack from "@clack/prompts";
import { Argument, createCommand } from "commander";
import { addDependency, detectPackageManager, removeDependency } from "nypm";
import type { FileOp, InstallContext, InstallResult, UninstallContext, UninstallResult } from "#src/plugin/types.ts";
import { ConfigAstService } from "#src/services/config-ast.ts";
import type { Context } from "#src/services/ctx.ts";
import { applyJsonEdits } from "#src/services/json-edit.ts";
import { logger } from "#src/services/logger.ts";
import { OFFICIAL_PLUGINS, type OfficialAlias, officialAliases } from "#src/services/plugins-registry.ts";
import { createClackPrompts } from "#src/services/prompts.ts";
import { ReleaseService } from "#src/services/release.ts";
import { describeWorkspaceChoice, resolveWorkspaceChoice, toNypmWorkspace } from "#src/services/workspace-target.ts";

type AddOptions = {
  force?: boolean;
  yes?: boolean;
  dryRun?: boolean;
};

type RemoveOptions = {
  yes?: boolean;
  dryRun?: boolean;
};

type InstallHook = (ctx: InstallContext) => Promise<InstallResult>;
type UninstallHook = (ctx: UninstallContext) => Promise<UninstallResult>;
type PluginModule = { default?: (opts?: unknown) => { install?: InstallHook; uninstall?: UninstallHook } };

export function createPluginsCommand(ctx: Context) {
  const cmd = createCommand("plugins").description("manage @rrlab plugins");

  cmd
    .command("list")
    .description("list plugins configured in run-run.config.{ts,mts}")
    .action(() => runList(ctx));

  cmd
    .command("add")
    .description("install and configure an @rrlab plugin")
    .addArgument(
      new Argument("<name>", `plugin alias (${officialAliases().join("|")}), optionally with @<spec> e.g. biome@pr-226`),
    )
    .option("--force", "re-run install even if the plugin is already configured")
    .option("--yes", "skip prompts and use defaults (non-interactive)")
    .option("--dry-run", "show what would happen, without applying changes")
    .action((name: string, opts: AddOptions) => runAdd(ctx, name, opts));

  cmd
    .command("remove")
    .description("uninstall an @rrlab plugin and undo its config files + deps")
    .addArgument(new Argument("<name>", "plugin alias to remove").choices(officialAliases()))
    .option("--yes", "skip the confirmation prompt")
    .option("--dry-run", "print the plan without applying changes")
    .action((name: OfficialAlias, opts: RemoveOptions) => runRemove(ctx, name, opts));

  return cmd;
}

async function runList(ctx: Context) {
  const ast = new ConfigAstService();
  const loaded = await ast.load(ctx.appPkg.dirPath);
  if (loaded.isNew) {
    logger.info("No run-run.config.{ts,mts} found. Use `rr plugins add <name>` to start.");
    return;
  }
  const plugins = ast.listPlugins(loaded.mod);
  const rel = path.relative(ctx.appPkg.dirPath, loaded.filepath) || loaded.filepath;
  if (plugins.length === 0) {
    logger.info(`${rel}: no plugins configured.`);
    return;
  }
  logger.info(`${rel}:`);
  for (const name of plugins) {
    logger.info(`  - ${name}`);
  }
}

async function runAdd(ctx: Context, name: string, opts: AddOptions) {
  const { alias, spec } = parseAliasSpec(name);
  if (!(alias in OFFICIAL_PLUGINS)) {
    throw new Error(`'${alias}' is invalid for argument 'name'. Allowed choices are ${officialAliases().join(", ")}.`);
  }
  const { pkg: pkgName, exportName } = OFFICIAL_PLUGINS[alias as OfficialAlias];
  const tag = spec && isDistTag(spec) ? spec : undefined;
  const installSpec = spec ? `${pkgName}@${spec}` : pkgName;

  clack.intro(` rr plugins add ${name} `);

  const inPkg = hasInPackageJson(ctx, pkgName);
  const ast = new ConfigAstService();
  const loaded = await ast.load(ctx.appPkg.dirPath);
  const inConfig = !loaded.isNew && ast.hasPlugin(loaded.mod, exportName);

  if (inPkg && inConfig && !opts.force && !spec) {
    clack.log.warn(`${pkgName} is already installed and configured. Use --force to re-run install.`);
    clack.outro("Nothing to do.");
    return;
  }

  const pm = await detectPackageManager(ctx.appPkg.dirPath);
  const wsChoice = resolveWorkspaceChoice(ctx.appPkg, pm);
  const workspace = toNypmWorkspace(wsChoice);
  const targetLabel = describeWorkspaceChoice(wsChoice);
  // A spec means "(re)install at this spec" — upgrade even when the package is already in package.json.
  const willInstall = !inPkg || !!spec;

  if (opts.dryRun) {
    const presence = willInstall
      ? inPkg
        ? " (already present, will be updated to this spec)"
        : ""
      : " (already present, skipped)";
    clack.log.info(`Would: install ${installSpec} as a devDependency in ${targetLabel}${presence}.`);
    if (!inConfig) {
      const rel = path.relative(ctx.appPkg.dirPath, loaded.filepath) || loaded.filepath;
      clack.log.info(`Would: add ${exportName}() to ${rel} (plugins[]).`);
    }
    clack.log.info("Would: run the plugin's install() hook (if any) to fetch peer deps and create files.");
    clack.outro("Dry run complete.");
    return;
  }

  let installedNow = false;
  if (willInstall) {
    await withSpinner(`Installing ${installSpec}`, async () => {
      await addDependency([installSpec], { cwd: ctx.appPkg.dirPath, dev: true, silent: true, workspace });
    });
    // Only mark for rollback when this was a fresh install — a failed upgrade can't be safely reverted to the previous version.
    if (!inPkg) installedNow = true;
  }

  let installResult: InstallResult | undefined;
  try {
    const mod = (await import(pkgName)) as PluginModule;
    const factory = mod.default;
    if (typeof factory !== "function") {
      throw new Error(`Plugin '${pkgName}' did not export a default factory function.`);
    }
    const plugin = factory();
    if (plugin.install) {
      const installCtx: InstallContext = {
        shell: ctx.shell,
        logger,
        appPkg: ctx.appPkg,
        prompts: createClackPrompts(),
        flags: {
          force: !!opts.force,
          yes: !!opts.yes,
          nonInteractive: !!opts.yes,
        },
        release: new ReleaseService(tag),
      };
      installResult = await plugin.install(installCtx);
    }
  } catch (err) {
    if (installedNow) {
      try {
        await removeDependency(pkgName, { cwd: ctx.appPkg.dirPath, silent: true, workspace });
      } catch {
        // best-effort rollback — don't mask the original error
      }
    }
    throw err;
  }

  if (installResult?.devDependencies && Object.keys(installResult.devDependencies).length > 0) {
    const names = Object.keys(installResult.devDependencies);
    const deps = Object.entries(installResult.devDependencies).map(([k, v]) => `${k}@${v}`);
    await withSpinner(`Installing ${names.join(", ")}`, async () => {
      await addDependency(deps, { cwd: ctx.appPkg.dirPath, dev: true, silent: true, workspace });
    });
  }
  for (const op of installResult?.files ?? []) {
    await applyFileOp(ctx.appPkg.dirPath, op, !!opts.force);
  }

  if (!inConfig) {
    ast.addPlugin(loaded.mod, { exportName, pkgName });
    await ast.save(loaded);
    const rel = path.relative(ctx.appPkg.dirPath, loaded.filepath) || loaded.filepath;
    clack.log.success(`Updated ${rel}`);
  }

  clack.outro(`Plugin '${alias}' ready 🎉`);
}

async function runRemove(ctx: Context, alias: OfficialAlias, opts: RemoveOptions) {
  const { pkg: pkgName, exportName } = OFFICIAL_PLUGINS[alias];

  clack.intro(` rr plugins remove ${alias} `);

  const ast = new ConfigAstService();
  const loaded = await ast.load(ctx.appPkg.dirPath);
  const inConfig = !loaded.isNew && ast.hasPlugin(loaded.mod, exportName);

  // Collect plugin's uninstall plan (only if pkg is installed + has uninstall hook).
  let uninstallResult: UninstallResult | undefined;
  if (hasInPackageJson(ctx, pkgName)) {
    try {
      const mod = (await import(pkgName)) as PluginModule;
      const factory = mod.default;
      const plugin = typeof factory === "function" ? factory() : undefined;
      if (plugin?.uninstall) {
        uninstallResult = await plugin.uninstall({
          shell: ctx.shell,
          logger,
          appPkg: ctx.appPkg,
          prompts: createClackPrompts(),
          flags: { yes: !!opts.yes, nonInteractive: !!opts.yes },
        });
      }
    } catch (err) {
      clack.log.warn(`Could not load ${pkgName} for uninstall hook: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const planSteps: string[] = [];
  if (inConfig) {
    const rel = path.relative(ctx.appPkg.dirPath, loaded.filepath) || loaded.filepath;
    planSteps.push(`Remove ${exportName}() from ${rel}`);
  }
  for (const op of uninstallResult?.files ?? []) {
    planSteps.push(describeFileOp(op));
  }
  const depsToRemove = (uninstallResult?.removeDependencies ?? []).filter((dep) => hasInPackageJson(ctx, dep));
  if (hasInPackageJson(ctx, pkgName) && !depsToRemove.includes(pkgName)) {
    depsToRemove.unshift(pkgName);
  }
  const pm = await detectPackageManager(ctx.appPkg.dirPath);
  const wsChoice = resolveWorkspaceChoice(ctx.appPkg, pm);
  const workspace = toNypmWorkspace(wsChoice);

  if (depsToRemove.length > 0) {
    planSteps.push(`Uninstall: ${depsToRemove.join(", ")} (from ${describeWorkspaceChoice(wsChoice)})`);
  }

  if (planSteps.length === 0) {
    clack.log.warn(`Plugin '${alias}' is not installed nor configured.`);
    clack.outro("Nothing to do.");
    return;
  }

  clack.log.message(`Plan:\n${planSteps.map((s) => `  • ${s}`).join("\n")}`);

  if (opts.dryRun) {
    clack.outro("Dry run complete.");
    return;
  }

  if (!opts.yes) {
    const choice = await clack.confirm({ message: "Proceed?", initialValue: false });
    if (clack.isCancel(choice) || choice !== true) {
      clack.outro("Aborted.");
      return;
    }
  }

  // Apply file ops first (they may need the plugin's source to still be importable).
  for (const op of uninstallResult?.files ?? []) {
    await applyFileOp(ctx.appPkg.dirPath, op, /* force */ true);
  }
  if (inConfig) {
    ast.removePlugin(loaded.mod, exportName);
    await ast.save(loaded);
    const rel = path.relative(ctx.appPkg.dirPath, loaded.filepath) || loaded.filepath;
    clack.log.success(`Removed ${exportName}() from ${rel}`);
  }
  for (const dep of depsToRemove) {
    await withSpinner(`Uninstalling ${dep}`, async () => {
      await removeDependency(dep, { cwd: ctx.appPkg.dirPath, silent: true, workspace });
    });
  }

  clack.outro(`Plugin '${alias}' removed.`);
}

function parseAliasSpec(input: string): { alias: string; spec?: string } {
  const at = input.indexOf("@");
  if (at <= 0) return { alias: input };
  return { alias: input.slice(0, at), spec: input.slice(at + 1) };
}

/** A dist-tag starts with a letter and contains only safe identifier chars. Version ranges (`^0.1`, `>=1`, `0.0.2`, `*`) don't match. */
function isDistTag(spec: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(spec) && spec !== "latest";
}

function hasInPackageJson(ctx: Context, pkgName: string): boolean {
  const pkg = ctx.appPkg.packageJson;
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };
  return pkgName in deps;
}

async function withSpinner<T>(message: string, fn: () => Promise<T>): Promise<T> {
  const sp = clack.spinner();
  sp.start(message);
  try {
    const result = await fn();
    sp.stop(message);
    return result;
  } catch (err) {
    sp.stop(`${message} — failed`, 1);
    throw err;
  }
}

function describeFileOp(op: FileOp): string {
  switch (op.kind) {
    case "create":
      return `${op.overwrite ? "Overwrite" : "Create"} ${op.path}`;
    case "edit-json":
      return `Edit ${op.path} (${op.edits.length} change${op.edits.length === 1 ? "" : "s"})`;
    case "edit-text":
      return `Edit ${op.path}`;
    case "delete":
      return `Delete ${op.path}`;
  }
}

async function applyFileOp(cwd: string, op: FileOp, force: boolean) {
  const abs = path.join(cwd, op.path);
  if (op.kind === "create") {
    const exists = await pathExists(abs);
    if (exists && !op.overwrite && !force) {
      clack.log.warn(`Skipping ${op.path} — already exists. Use --force to overwrite.`);
      return;
    }
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, op.content, "utf8");
    clack.log.success(`${exists ? "Overwrote" : "Created"} ${op.path}`);
    return;
  }
  if (op.kind === "edit-json") {
    if (!(await pathExists(abs))) {
      clack.log.warn(`Skipping ${op.path} — file does not exist.`);
      return;
    }
    const source = await fs.readFile(abs, "utf8");
    const next = applyJsonEdits(source, op.edits);
    if (next !== source) {
      await fs.writeFile(abs, next, "utf8");
      clack.log.success(`Edited ${op.path}`);
    } else {
      clack.log.info(`No changes for ${op.path}.`);
    }
    return;
  }
  if (op.kind === "edit-text") {
    if (!(await pathExists(abs))) {
      clack.log.warn(`Skipping ${op.path} — file does not exist.`);
      return;
    }
    const source = await fs.readFile(abs, "utf8");
    const next = op.edit(source);
    if (next !== source) {
      await fs.writeFile(abs, next, "utf8");
      clack.log.success(`Edited ${op.path}`);
    } else {
      clack.log.info(`No changes for ${op.path}.`);
    }
    return;
  }
  if (op.kind === "delete") {
    if (!(await pathExists(abs))) return;
    await fs.unlink(abs);
    clack.log.success(`Deleted ${op.path}`);
    return;
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export { OFFICIAL_PLUGINS };
