import chalk, { type ChalkInstance } from "chalk";
import supportsColor from "supports-color";

// https://no-color.org/
const colorIsSupported = () => supportsColor.stdout && !process.env.NO_COLOR;

const identity = <T>(x: T) => x;
const safe = (style: ChalkInstance) => (colorIsSupported() ? style : identity);

export const logoBlue = safe(chalk.blueBright);
export const logoRed = safe(chalk.redBright);
export const logoGreen = safe(chalk.greenBright);
