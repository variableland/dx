import { type BoardTask, reportTask, runBoard } from "#src/render/board.ts";
import { fanoutTitle, targetLabel } from "#src/render/labels.ts";
import type { ContextValue } from "#src/services/context.ts";
import { logger } from "#src/services/logger.ts";
import type { Doctor, TypeChecker } from "#src/types/tool.ts";

export type TscActionConfig = {
  ctx: ContextValue;
  tsc: TypeChecker & Doctor;
};

type Scripts = Record<string, string | undefined> | undefined;

const getPreScript = (scripts: Scripts) => scripts?.pretsc ?? scripts?.pretypecheck;

export async function tscAction({ ctx, tsc }: TscActionConfig): Promise<void> {
  const { appPkg, shell } = ctx;

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
}
