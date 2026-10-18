import type { Pkg } from "@variablelab/clibuddy";
import { type BoardTask, reportTask, runBoard } from "#src/render/board.ts";
import { fanoutTitle, targetLabel } from "#src/render/labels.ts";
import type { ContextValue } from "#src/services/context.ts";
import { logger } from "#src/services/logger.ts";
import type { Doctor, TypeChecker } from "#src/types/tool.ts";

export type TscActionConfig = {
  ctx: ContextValue;
  tsc: TypeChecker & Doctor;
};

export type TscDoctorActionConfig = {
  ctx: ContextValue;
  tsc: TypeChecker & Doctor;
};

type Scripts = Record<string, string | undefined> | undefined;

const getPreScript = (scripts: Scripts) => scripts?.pretscheck ?? scripts?.pretsc ?? scripts?.pretypecheck;

const isTsProject = (appPkg: Pkg, dir: string) => appPkg.hasFile("tsconfig.json", dir);

/** The packages a monorepo's `rr tsc` checks: each workspace package with a `tsconfig.json`, never the root. */
async function getTsProjects(appPkg: Pkg) {
  const projects = await appPkg.getWorkspaceProjects();
  return projects.filter((project) => isTsProject(appPkg, project.rootDir));
}

export async function tscAction({ ctx, tsc }: TscActionConfig): Promise<void> {
  const { appPkg, shell } = ctx;

  // A package's `pretscheck`/`pretsc`/`pretypecheck` runs captured, inside the task, so its
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
    if (!isTsProject(appPkg, appPkg.dirPath)) {
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

  const tsProjects = await getTsProjects(appPkg);

  if (!tsProjects.length) {
    logger.warn("No ts projects found in the monorepo, skipping typecheck");
    return;
  }

  const tasks = tsProjects.map((p) => typecheckTask(p.manifest.name ?? p.rootDir, p.rootDir, p.manifest.scripts));
  const result = await runBoard(tasks, { title: fanoutTitle("tsc", tsc, tsProjects.length, "packages") });
  if (!result.ok) process.exitCode = 1;
}

/**
 * `rr tsc doctor` — the typecheck provider's `doctor`, run in the packages
 * `rr tsc` checks: in a monorepo, one row per workspace package with a
 * `tsconfig.json`; otherwise the single `doctor (<tool>) · <pkg>` row. Where
 * `rr tsc` would skip (no `tsconfig.json`), it still checks the current
 * package, since the tool can be broken there all the same.
 */
export async function tscDoctorAction({ ctx, tsc }: TscDoctorActionConfig): Promise<void> {
  const { appPkg } = ctx;
  const tsProjects = appPkg.isMonorepo() ? await getTsProjects(appPkg) : [];

  if (!tsProjects.length) {
    const label = targetLabel("doctor", tsc, appPkg);
    const result = await runBoard([reportTask(label, () => tsc.doctor({ cwd: appPkg.dirPath }))]);
    if (!result.ok) process.exitCode = 1;
    return;
  }

  const tasks = tsProjects.map((p) => reportTask(p.manifest.name ?? p.rootDir, () => tsc.doctor({ cwd: p.rootDir })));
  const result = await runBoard(tasks, { title: fanoutTitle("doctor", tsc, tsProjects.length, "packages") });
  if (!result.ok) process.exitCode = 1;
}
