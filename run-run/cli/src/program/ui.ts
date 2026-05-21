import { colorize, palette, text } from "@vlandoss/clibuddy";

export const CREDITS_TEXT = `\nAcknowledgment:
- kcd-scripts: for main inspiration
  ${palette.link("https://github.com/kentcdodds/kcd-scripts")}

- peruvian news: in honor to Run Run
  ${palette.link("https://es.wikipedia.org/wiki/Run_Run")}`;

const rimrafColor = colorize("#7C7270");
const runRunColor = colorize("#E8722A");
const usageColor = colorize("#24C55E");

/**
 * Labels used by kernel-internal commands. Plugin-owned tools (biome, oxc,
 * tsdown, tsc) define their own colored labels inside each plugin's
 * `src/index.ts`.
 */
export const TOOL_LABELS = {
  RIMRAF: rimrafColor("rimraf"),
  RUN_RUN: runRunColor("run-run"),
  USAGE: usageColor("usage"),
};

const IS_USAGE_MODE = process.env.RR_USAGE_MODE === "1";

/**
 * Renders the parenthesised backend hint that follows a command's summary,
 * e.g. `pack a ts library 📦 (tsdown)` or `… (not configured)` when no plugin
 * provides the capability.
 *
 * Returns an empty string when `RR_USAGE_MODE=1` is set (the kernel's `bin`
 * script exports it during `rr --usage`) so the KDL spec stays free of
 * per-environment state — the active plugin set is a property of the host
 * project, not of the CLI surface.
 */
export function pluginAnnotation(provider: { ui: string } | undefined): string {
  if (IS_USAGE_MODE) return "";
  return provider ? ` (${provider.ui})` : " (not configured)";
}

// npx figlet -f "ANSI Shadow" "run-run"
export function getBannerText(version: string) {
  const uiLogo = runRunColor(
    `
██████╗ ██╗   ██╗███╗   ██╗      ██████╗ ██╗   ██╗███╗   ██╗
██╔══██╗██║   ██║████╗  ██║      ██╔══██╗██║   ██║████╗  ██║
██████╔╝██║   ██║██╔██╗ ██║█████╗██████╔╝██║   ██║██╔██╗ ██║
██╔══██╗██║   ██║██║╚██╗██║╚════╝██╔══██╗██║   ██║██║╚██╗██║
██║  ██║╚██████╔╝██║ ╚████║      ██║  ██║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝      ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ${text.version(version)}
`.trim(),
  );

  return `
${uiLogo}

🦊 ${palette.italic(palette.muted("The CLI toolbox for"))} ${text.vland}\n`.trimStart();
}
