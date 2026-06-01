import { palette } from "@vlandoss/clibuddy";
import { Lines } from "#src/render/lines.ts";
import { configuredPlugins, pkgCell, pluginVersionCell, relPath } from "#src/render/plugin-view.ts";
import type { ContextValue } from "#src/services/context.ts";
import { SEP } from "#src/ui/theme.ts";

export type ConfigActionConfig = {
  ctx: ContextValue;
};

export function configAction({ ctx }: ConfigActionConfig): void {
  const { meta } = ctx.config;

  const lines = new Lines();

  lines
    .add(palette.bold("Source:"))
    .add(
      meta.filepath
        ? `${relPath(ctx, meta.filepath)}${SEP}${palette.dim(`loaded in ${Math.round(meta.loadMs)}ms`)}`
        : `${palette.dim("(no run-run.config — using defaults)")}`,
      2,
    )
    .add(palette.bold("\nPlugins:"));

  const plugins = configuredPlugins(ctx);

  if (!plugins.length) {
    lines.add(palette.dim("No plugins configured. Try `rr plugins add <name>`."), 2);
  } else {
    const rows = plugins.map((p) => ({
      name: `${p.color("●")} ${p.name}`,
      pkg: pkgCell(p.name),
      version: pluginVersionCell(p.name, ctx.appPkg.dirPath),
    }));

    // biome-ignore format: i prefer multilines here
    lines.addTable(rows, [
      { key: "name" },
      { key: "pkg", align: "right" },
      { key: "version" }
    ], { padStart: 2 });
  }

  lines.printStdout();
}
