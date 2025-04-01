import chalk, { type ChalkInstance } from "chalk";
import supportsColor from "supports-color";

// https://no-color.org/
const colorIsSupported = () => supportsColor.stdout && !Bun.env.NO_COLOR;

const identity = <T>(x: T) => x;
const safe = (style: ChalkInstance) => (colorIsSupported() ? style : identity);

export const colors = {
  blueBright: safe(chalk.blueBright),
  redBright: safe(chalk.redBright),
  greenBright: safe(chalk.greenBright),
};
