import { colorize, palette, text } from "@vlandoss/clibuddy";

const vlandColor = colorize("#a78bfa");
const usageColor = colorize("#24C55E");
const gigetColor = colorize("#F472B6");

export const TOOL_LABELS = {
  USAGE: usageColor("usage"),
  GIGET: gigetColor("giget"),
};

// npx figlet -f "ANSI Shadow" "vland"
export function getBannerText(version: string) {
  const uiLogo = vlandColor(
    `
██╗   ██╗██╗      █████╗ ███╗   ██╗██████╗
██║   ██║██║     ██╔══██╗████╗  ██║██╔══██╗
██║   ██║██║     ███████║██╔██╗ ██║██║  ██║
╚██╗ ██╔╝██║     ██╔══██║██║╚██╗██║██║  ██║
 ╚████╔╝ ███████╗██║  ██║██║ ╚████║██████╔╝
  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ${text.version(version)}
`.trim(),
  );

  return `
${uiLogo}

🦉 ${palette.italic(palette.muted("The CLI to init a new project in"))} ${text.vland}\n`.trimStart();
}
