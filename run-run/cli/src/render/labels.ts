import { basename } from "node:path";
import { type Pkg, palette } from "@vlandoss/clibuddy";

export type Provider = { ui: string };

/** `<command> (<tool>)` — the verb plus the `ui` of the tool that backs it (e.g. `lint (biome)`, `tsc (tsc)`). */
function commandTool(command: string, provider: Provider): string {
  return `${command} (${provider.ui})`;
}

function pkgName(appPkg: Pkg): string {
  return appPkg.packageJson.name ?? basename(appPkg.dirPath);
}

/** The canonical single-target row label, `<command> (<tool>) · <package>`, so every command reads alike. */
export function targetLabel(command: string, provider: Provider, appPkg: Pkg): string {
  return `${commandTool(command, provider)} ${palette.dim(`· ${pkgName(appPkg)}`)}`;
}

/**
 * The canonical fan-out section title, `<command> (<tool>) · <n> <unit>`. The
 * tool is omitted when the fan-out spans several tools (`rr doctor` → `doctor ·
 * 3 tools`), since the rows then carry the per-tool name.
 */
export function fanoutTitle(command: string, provider: Provider | undefined, count: number, unit: string): string {
  const head = provider ? commandTool(command, provider) : command;
  return `${head} · ${count} ${unit}`;
}
