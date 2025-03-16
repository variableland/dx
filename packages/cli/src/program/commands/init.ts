import { Option, createCommand } from "commander";
import { Log } from "~/logger";
import { $ } from "~/shell";
import { useStore } from "~/store";
import { cwd } from "~/utils/cwd";

export const initCommand = createCommand("init")
  .description("init a project 👷‍♂️")
  .addOption(
    new Option("-t, --template <template>", "specify the template")
      // it corresponds /plopfiles/templates/<template>
      .choices(["lib"])
      .makeOptionMandatory(true),
  )
  .action(async function initAction(options) {
    const store = useStore();

    try {
      // This is the only way to pass predefined options to Plop
      // when it's wrapped due to the way Plop is designed.
      process.argv = [...process.argv.slice(0, 2), ...["--template", options.template]];

      // Dynamic import to avoid reading the process.argv
      // before overwriting it with the predefined options
      const { runPlop } = await import("~/utils/plop");

      await runPlop({
        rrPath: store.rrPkg.dirPath,
        dest: cwd,
      });
    } catch (error) {
      Log.error("Failed to run init", error);
      process.exit(1);
    }
  })
  .addHelpText("afterAll", "\nUnder the hood, this command uses the PlopJS to generate the code.");
