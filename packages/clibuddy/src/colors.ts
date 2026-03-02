import chalk, { type ChalkInstance } from "chalk";
import supportsColor from "supports-color";

// https://no-color.org/
export const colorIsSupported = () => supportsColor.stdout && !process.env.NO_COLOR;

const identity = <T>(x: T) => x;
const safe = (style: ChalkInstance) => (colorIsSupported() ? style : identity);

export const colorize = (hex: string) => safe(chalk.hex(hex));

export const palette = {
  bold: safe(chalk.bold),
  italic: safe(chalk.italic),
  link: safe(chalk.underline),
  muted: safe(chalk.dim),
  vland: colorize("#36d399"),
};
