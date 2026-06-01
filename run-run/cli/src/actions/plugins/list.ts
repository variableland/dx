import path from "node:path";
import { ConfigAstService } from "#src/services/config-ast.ts";
import type { ContextValue } from "#src/services/context.ts";
import { logger } from "#src/services/logger.ts";

export type ListPluginsActionConfig = {
  ctx: ContextValue;
};

export async function listPluginsAction({ ctx }: ListPluginsActionConfig): Promise<void> {
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
