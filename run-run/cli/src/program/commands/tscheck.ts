import { cwd, type ShellService } from "@vlandoss/clibuddy";
import type { AnyLogger } from "@vlandoss/loggy";
import { createCommand } from "commander";
import type { Doctor, TypeChecker } from "#src/plugin/types.ts";
import type { Context } from "#src/services/ctx.ts";
import { logger } from "#src/services/logger.ts";
import { missingPluginError } from "../missing-plugin.ts";
import { pluginAnnotation } from "../ui.ts";
import { createDoctorSubcommand } from "./doctor.ts";

type TypecheckAtOptions = {
  dir: string;
  scripts: Record<string, string | undefined> | undefined;
  log: AnyLogger;
  shell: ShellService;
  tsc: TypeChecker & Doctor;
};

const getPreScript = (scripts: Record<string, string | undefined> | undefined) => scripts?.pretsc ?? scripts?.pretypecheck;

async function typecheckAt({ dir, scripts, log, shell, tsc }: TypecheckAtOptions) {
  log.debug(`checking types at ${dir}`);

  const shellAt = cwd === dir ? shell : shell.at(dir);

  try {
    const preScript = getPreScript(scripts);
    if (preScript) {
      log.start(`Running pre-script: ${preScript}`);
      // Pre-scripts come from package.json and may contain shell features
      // (`&&`, pipes, env-var substitution) — run them through `/bin/sh -c`.
      await shellAt.run(preScript, [], { shell: true });
      log.success("Pre-script completed");
    }

    log.start("Type checking started");
    if (cwd === dir) {
      await tsc.check();
    } else {
      await tsc.check({ cwd: dir });
    }
    log.success("Typecheck completed");
  } catch (error) {
    log.error("Typecheck failed");
    throw error;
  }
}

export function createTsCheckCommand(ctx: Context) {
  const { appPkg, shell } = ctx;
  const tsc = ctx.registry.get("tsc");

  const cmd = createCommand("tsc")
    .alias("tscheck")
    .summary(`check typescript errors${pluginAnnotation(tsc)}`)
    .description(
      "Checks the TypeScript code for type errors, ensuring that the code adheres to the defined type constraints and helps catch potential issues before runtime.",
    );

  if (tsc) {
    cmd.addCommand(createDoctorSubcommand(tsc));
    cmd.addHelpText("afterAll", `\nUnder the hood, this command uses the ${tsc.ui} CLI to check the code.`);
  }

  cmd.action(async () => {
    if (!tsc) throw missingPluginError("tsc");

    const isTsProject = (dir: string) => appPkg.hasFile("tsconfig.json", dir);

    if (!appPkg.isMonorepo()) {
      if (!isTsProject(appPkg.dirPath)) {
        logger.info("No tsconfig.json found, skipping typecheck");
        return;
      }

      await typecheckAt({
        shell,
        tsc,
        dir: appPkg.dirPath,
        scripts: appPkg.packageJson.scripts,
        log: logger,
      });

      return;
    }

    const projects = await appPkg.getWorkspaceProjects();
    const tsProjects = projects.filter((project) => isTsProject(project.rootDir));

    if (!tsProjects.length) {
      logger.warn("No ts projects found in the monorepo, skipping typecheck");
      return;
    }

    await Promise.all(
      tsProjects.map((p) =>
        typecheckAt({
          shell,
          tsc,
          dir: p.rootDir,
          scripts: p.manifest.scripts,
          log: logger.child({
            tag: p.manifest.name,
            namespace: "typecheck",
          }),
        }),
      ),
    );
  });

  return cmd;
}
