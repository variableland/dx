import { palette, text } from "@variablelab/clibuddy";
import { runRunColor } from "#src/ui/theme.ts";
import { Lines } from "./lines.ts";

// npx figlet -f "ANSI Shadow" "run-run"
export function getBannerText(version: string) {
  const UI_LOGO = runRunColor(
    `
██████╗ ██╗   ██╗███╗   ██╗      ██████╗ ██╗   ██╗███╗   ██╗
██╔══██╗██║   ██║████╗  ██║      ██╔══██╗██║   ██║████╗  ██║
██████╔╝██║   ██║██╔██╗ ██║█████╗██████╔╝██║   ██║██╔██╗ ██║
██╔══██╗██║   ██║██║╚██╗██║╚════╝██╔══██╗██║   ██║██║╚██╗██║
██║  ██║╚██████╔╝██║ ╚████║      ██║  ██║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝      ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ${text.version(version)}`.trimStart(),
  );

  const lines = new Lines();

  return lines
    .add(UI_LOGO)
    .newline()
    .add(`🦊 ${palette.italic(palette.dim("The CLI toolbox for"))} ${text.vland}`)
    .newline()
    .render();
}
