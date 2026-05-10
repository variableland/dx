import { colorize, palette, text } from "@vlandoss/clibuddy";

export const CREDITS_TEXT = `\nAcknowledgment:
- kcd-scripts: for main inspiration
  ${palette.link("https://github.com/kentcdodds/kcd-scripts")}

- peruvian news: in honor to Run Run
  ${palette.link("https://es.wikipedia.org/wiki/Run_Run")}`;

const tsdownColor = colorize("#FF7E18");
const biomeColor = colorize("#61A5FA");
const oxlintColor = colorize("#32F3E9");
const oxfmtColor = colorize("#32F3E9");
const tscColor = colorize("#3178C6");
const rimrafColor = colorize("#7C7270");
const runRunColor = colorize("#E8722A");
const usageColor = colorize("#24C55E");

export const TOOL_LABELS = {
  TSDOWN: tsdownColor("tsdown"),
  BIOME: biomeColor("biome"),
  OXLINT: oxlintColor("oxlint"),
  OXFMT: oxfmtColor("oxfmt"),
  TSC: tscColor("tsc"),
  RIMRAF: rimrafColor("rimraf"),
  RUN_RUN: runRunColor("run-run"),
  USAGE: usageColor("usage"),
};

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
