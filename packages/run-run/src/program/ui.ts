import { colorIsSupported, colorize, palette } from "@vlandoss/clibuddy";

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

export const TOOL_LABELS = {
  TSDOWN: tsdownColor("tsdown"),
  BIOME: biomeColor("biome"),
  OXLINT: oxlintColor("oxlint"),
  OXFMT: oxfmtColor("oxfmt"),
  TSC: tscColor("tsc"),
  RIMRAF: rimrafColor("rimraf"),
};

export function getBannerText(version: string) {
  const uiLogo = `🦊 ${palette.bold("R")} ${palette.bold("U")} ${palette.bold("N")} - ${palette.bold("R")} ${palette.bold("U")} ${palette.bold("N")}`;
  const vlandLogo = `${palette.vland("Variable Land")} 👊`;

  const title = `${uiLogo} ${palette.muted(`v${version}`)}`;
  const subtitle = `${palette.italic(palette.muted("The CLI toolbox for"))} ${vlandLogo}`;

  if (!colorIsSupported()) {
    return `${title}\n${subtitle}\n`;
  }

  const FOX_COLORS = {
    BLACK: colorize("#39393A"),
    ORANGE: colorize("FC7A1e"),
    WHITE: colorize("#FFFFFF"),
  };

  const _ = "  "; // hole
  const B = FOX_COLORS.BLACK("██"); // black
  const O = FOX_COLORS.ORANGE("██"); // orange
  const W = FOX_COLORS.WHITE("██"); // white

  const grid = [
    [_, B, _, _, _, _, _, B, _],
    [_, O, W, _, _, _, W, O, _],
    [_, O, W, O, _, O, W, O, _],
    [B, O, O, O, O, O, O, O, B],
    [O, O, O, O, O, O, O, O, O],
    [W, O, B, O, O, O, B, O, W],
    [_, W, W, O, O, O, W, W, _],
    [_, _, W, W, B, W, W, _, _],
    [_, _, _, W, W, W, _, _, _],
  ];

  const lines = grid.map((row) => row.join(""));

  lines[3] += `    ${title}`;
  lines[4] += `    ${subtitle}`;

  return `${lines.join("\n")}\n`;
}
