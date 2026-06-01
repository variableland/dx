import { generateToStdout } from "@usage-spec/commander";
import { palette } from "@vlandoss/clibuddy";
import { Command } from "commander";
import { getBannerText } from "#src/render/banner.ts";
import { getFooterText } from "#src/render/footer.ts";
import { Lines } from "#src/render/lines.ts";
import type { ContextValue } from "#src/services/context.ts";

export class RunRunCmd extends Command {
  ctx: ContextValue;

  constructor(ctx: ContextValue) {
    super("rr");
    this.ctx = ctx;
    this.#init();
  }

  async run() {
    await this.parseAsync();
  }

  #init() {
    this.enablePositionalOptions()
      .showSuggestionAfterError(true)
      .helpCommand(false)
      .version(this.ctx.binPkg.version, "-v, --version", "output the version number")
      .addHelpText("before", this.#banner())
      .addHelpText("after", this.#footer())
      .option("--about", "show credits & inspiration")
      .option("--usage", `print KDL spec for this CLI (${palette.dim(palette.link("https://kdl.dev"))})`)
      .on("option:about", () => this.#aboutStdout())
      .on("option:usage", () => this.#usageStdout(this));
  }

  #aboutStdout() {
    const lines = new Lines();

    lines
      .add(this.#banner())
      .add(palette.bold("Inspired by:"), 2)
      .add(`kcd-scripts — ${palette.link("https://github.com/kentcdodds/kcd-scripts")}`, 4)
      .newline()
      .add(palette.bold("Named in honor of:"), 2)
      .add(`Run Run (Peruvian news segment) — ${palette.link("https://es.wikipedia.org/wiki/Run_Run")}`, 4)
      .printStdout();

    process.exit(0);
  }

  #usageStdout(cmd: Command) {
    generateToStdout(cmd);
    process.exit(0);
  }

  #banner() {
    return getBannerText(this.ctx.binPkg.version);
  }

  #footer() {
    return getFooterText(this.ctx);
  }
}
