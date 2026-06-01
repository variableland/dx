import { palette } from "@vlandoss/clibuddy";
import { Lines } from "#src/render/lines.ts";
import type { ContextValue } from "#src/services/context.ts";
import { SEP } from "#src/ui/theme.ts";
import { availableCell, installedCell, partitionPlugins, relPath } from "./plugin-view.ts";

export function getFooterText(ctx: ContextValue): string {
  const { installed, available } = partitionPlugins(ctx);

  const installedLine = installed.map(installedCell).join("   ");
  const availableLine = available.map(availableCell).join("   ");
  const fromLine = ctx.config.meta.filepath
    ? palette.dim(`from ${relPath(ctx, ctx.config.meta.filepath)}`)
    : palette.dim("(no run-run.config — using defaults)");

  const lines = new Lines();

  lines.newline().add(palette.bold("Plugins:"));

  if (installed.length > 0) {
    lines.add(`${palette.bold("installed:")}  ${installedLine}${SEP}${fromLine}`, 2);
  } else {
    lines.add(`${palette.bold("installed:")}  ${palette.dim("(none)")}${SEP}${fromLine}`, 2);
  }

  if (available.length > 0) {
    lines.add(`${palette.bold("available:")}  ${availableLine}${SEP}${palette.dim("install with `rr plugins add <name>`")}`, 2);
  }

  return lines.render();
}
