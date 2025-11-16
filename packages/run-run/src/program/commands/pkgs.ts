import path from "node:path";
import { type Command, createCommand, Option } from "commander";
import memoize from "memoize";
import type { Context } from "#/services/ctx";
import { logger } from "#/services/logger";

// Currently only "turbo" is supported, but this can be extended in the future
const decorators = ["turbo"] as const;

type Options = {
  files: string[];
  decorator?: (typeof decorators)[number];
};

export function createPkgsCommand(ctx: Context) {
  return createCommand("pkgs")
    .alias("packages")
    .description("list unique affected packages from list of files 📦")
    .addOption(new Option("--files <files...>", "list of files to check"))
    .addOption(new Option("--decorator [type]", "type of decorator to use").choices(decorators))
    .action(async function pkgsAction({ files, decorator }: Options, cmd: Command) {
      const { appPkg } = ctx;

      if (!appPkg.isMonorepo()) {
        const cmdName = cmd.parent?.args[0] ?? cmd.args[0] ?? cmd.name();
        logger.error(`The \`${cmdName}\` command can only be run in a monorepo.`);
        return process.exit(1);
      }

      const projects = await appPkg.getWorkspaceProjects();

      const getRelativeRootDir = memoize((rootDir: string) => {
        const appDir = appPkg.dirPath;

        if (!path.isAbsolute(rootDir)) {
          return rootDir;
        }

        return path.relative(appDir, rootDir);
      });

      function getPackageForFile(filePath: string) {
        for (const project of projects) {
          const relativeRootDir = getRelativeRootDir(project.rootDir);

          if (filePath.startsWith(relativeRootDir)) {
            return project;
          }
        }

        return null;
      }

      const uniquePkgsNames = new Set<string>();

      files.forEach((file) => {
        const pkg = getPackageForFile(file);
        if (pkg?.manifest.name) {
          uniquePkgsNames.add(pkg.manifest.name);
        }
      });

      if (!uniquePkgsNames.size) {
        return;
      }

      const pkgsNames = Array.from(uniquePkgsNames);

      if (decorator === "turbo") {
        console.log(...pkgsNames.map((name) => `--filter=...${name}`));
      } else {
        console.log(...pkgsNames);
      }
    });
}
