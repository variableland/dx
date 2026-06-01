import { palette } from "./colors.ts";

export const text = {
  vland: palette.link(palette.primary("https://variable.land")),
  version: (version: string) => palette.dim(`v${version}`),
};
