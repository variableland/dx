import { createCommand } from "commander";
import { $ } from "~/shell";
import { raw } from "~/utils/raw";

export const lintCommand = createCommand("lint")
  .description("lint the code 🧹")
  .option("-f, --fix", "fix the linting issues")
  .action(async function lintAction(options) {
    const cmd = `eslint --ignore-path .gitignore --ext .js,.jsx,.ts,.tsx`;

    if (options.fix) {
      await $`${raw(cmd)} . --fix`;
    } else {
      await $`${raw(cmd)} .`;
    }
  })
  .addHelpText(
    "afterAll",
    "\nUnder the hood, this command uses the `eslint` CLI to lint the code.",
  );
