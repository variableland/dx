import { createCommand } from "commander";
import type { Context } from "#src/services/ctx.ts";
import { logger } from "#src/services/logger.ts";
import { type BoardTask, fanoutTitle, reportTask, runBoard, targetLabel } from "../board.ts";
import { missingPluginError } from "../missing-plugin.ts";
import { pluginAnnotation } from "../ui.ts";
import { createDoctorSubcommand } from "./doctor.ts";

type Scripts = Record<string, string | undefined> | undefined;

const getPreScript = (scripts: Scripts) => scripts?.pretsc ?? scripts?.pretypecheck;

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
    cmd.addCommand(createDoctorSubcommand(tsc, ctx.appPkg));
    cmd.addHelpText("afterAll", `\nUnder the hood, this command uses the ${tsc.ui} CLI to check the code.`);
  }

  cmd.action(async () => {
    if (!tsc) throw missingPluginError("tsc");

    const isTsProject = (dir: string) => appPkg.hasFile("tsconfig.json", dir);

    // A package's `pretsc`/`pretypecheck` runs captured, inside the task, so its
    // output stays grouped with that package. It may use shell features, so it
    // goes through `/bin/sh -c`. A failing pre-script fails the task before tsc.
    const typecheckTask = (label: string, dir: string, scripts: Scripts): BoardTask =>
      reportTask(label, async () => {
        const preScript = getPreScript(scripts);
        if (preScript) {
          const pre = await shell.at(dir).runCaptured(preScript, [], { shell: true, throwOnError: false });
          if ((pre.exitCode ?? 0) !== 0) {
            const output = [pre.stdout, pre.stderr]
              .map((s) => s?.trim())
              .filter(Boolean)
              .join("\n");
            return { ok: false, output: `pre-script \`${preScript}\` failed\n${output}` };
          }
        }
        return tsc.check({ cwd: dir });
      });

    if (!appPkg.isMonorepo()) {
      if (!isTsProject(appPkg.dirPath)) {
        logger.info("No tsconfig.json found, skipping typecheck");
        return;
      }

      // Single package → compact board; the row carries the canonical
      // `tsc (<tool>) · <pkg>` label like every other single-target command.
      const label = targetLabel("tsc", tsc, appPkg);
      const result = await runBoard([typecheckTask(label, appPkg.dirPath, appPkg.packageJson.scripts)]);
      if (!result.ok) process.exitCode = 1;
      return;
    }

    const projects = await appPkg.getWorkspaceProjects();
    const tsProjects = projects.filter((project) => isTsProject(project.rootDir));

    if (!tsProjects.length) {
      logger.warn("No ts projects found in the monorepo, skipping typecheck");
      return;
    }

    const tasks = tsProjects.map((p) => typecheckTask(p.manifest.name ?? p.rootDir, p.rootDir, p.manifest.scripts));
    const result = await runBoard(tasks, { title: fanoutTitle("tsc", tsc, tsProjects.length, "packages") });
    if (!result.ok) process.exitCode = 1;
  });

  return cmd;
}
