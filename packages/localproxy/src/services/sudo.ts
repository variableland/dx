import { password as passwordPrompt } from "@inquirer/prompts";
import type { ShellService } from "@vlandoss/clibuddy";
import { logger } from "./logger";
import { silentShell } from "./shell";

const debug = logger.subdebug("sudo");

export class SudoService {
  #shell: ShellService;

  constructor() {
    this.#shell = silentShell.child({
      stdio: ["ignore", "ignore", "pipe"],
    });
  }

  async auth() {
    if (!(await this.isAuthorized())) {
      await this.authenticate();
    }
  }

  async isAuthorized() {
    const { exitCode } = await this.#shell.$`sudo -v -n`.nothrow();
    return exitCode === 0;
  }

  async authenticate() {
    let intent = 1;
    let exitCode = null;

    await passwordPrompt({
      message: "Enter sudo password to manage hosts",
      mask: true,
      validate: async (value) => {
        debug("Attempting sudo authentication %o", { intent });

        const output = await this.#shell.$`echo "${value}" | sudo -S -v`.nothrow();
        exitCode = output.exitCode;

        debug("Sudo authentication exitCode(%d)", exitCode);

        if (intent >= 3) {
          return true;
        }

        intent++;

        return output.exitCode === 0 ? true : "Invalid password";
      },
    });

    if (exitCode !== 0) {
      logger.error("`sudo` authentication failed");
      process.exit(1);
    }
  }
}
