import { cwd, type ShellService } from "@vlandoss/clibuddy";
import type { AnyLogger } from "@vlandoss/loggy";
import { createCommand } from "commander";
import type { Context } from "#/services/ctx";
import { logger } from "#/services/logger";
import { OxlintService } from "#/services/oxlint";

type TypecheckAtOptions = {
  dir: string;
  scripts: Record<string, string | undefined> | undefined;
  log: AnyLogger;
  shell: ShellService;
  run: (shell: ShellService) => Promise<void>;
};

const getPreScript = (scripts: Record<string, string | undefined> | undefined) => scripts?.pretsc ?? scripts?.pretypecheck;

async function typecheckAt({ dir, scripts, log, shell, run }: TypecheckAtOptions) {
  let shellAt: ShellService;

  log.debug(`checking types at ${dir}`);

  if (cwd === dir) {
    shellAt = shell;
  } else {
    log.debug(`Changing directory to ${dir} for typecheck`);
    shellAt = shell.at(dir);
  }

  try {
    const preScript = getPreScript(scripts);
    if (preScript) {
      log.start(`Running pre-script: ${preScript}`);
      await shellAt.$`${preScript}`;
      log.success("Pre-script completed");
    }

    log.start("Type checking started");
    await run(shellAt);
    log.success("Typecheck completed");
  } catch (error) {
    log.error("Typecheck failed");
    throw error;
  }
}

export function createTypecheckCommand(ctx: Context) {
  const {
    appPkg,
    shell,
    config: { config },
  } = ctx;

  return createCommand("tsc")
    .alias("typecheck")
    .description("check if TypeScript code is well typed 🎨")
    .addHelpText(
      "afterAll",
      `\nUnder the hood, this command uses the ${config.future?.oxc ? "oxlint" : "TypeScript"} CLI to check the code.`,
    )
    .action(async function typecheckAction() {
      const isTsProject = (dir: string) => appPkg.hasFile("tsconfig.json", dir);

      const runTypecheck = async (shell: ShellService) => {
        if (config.future?.oxc) {
          const oxlint = new OxlintService(shell);
          await oxlint.exec(`--type-aware --type-check --report-unused-disable-directives`);
        } else {
          await shell.$`tsc --noEmit`;
        }
      };

      if (!appPkg.isMonorepo()) {
        if (!isTsProject(appPkg.dirPath)) {
          logger.info("No tsconfig.json found, skipping typecheck");
          return;
        }

        await typecheckAt({
          shell,
          run: runTypecheck,
          dir: appPkg.dirPath,
          scripts: appPkg.packageJson.scripts,
          log: logger,
        });

        return;
      }

      const projects = await appPkg.getWorkspaceProjects();
      const tsProjects = projects.filter((project) => isTsProject(project.rootDir));

      if (!tsProjects.length) {
        logger.warn("No TypeScript projects found in the monorepo, skipping typecheck");
        return;
      }

      await Promise.all(
        tsProjects.map((p) =>
          typecheckAt({
            shell,
            run: runTypecheck,
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
}
