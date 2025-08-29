import { logger } from "./logger";
import { quietShell, silentShell, verboseShell } from "./shell";
import { SudoService } from "./sudo";

type SetupOptions = {
  verbose: boolean;
};

const debug = logger.subdebug("hosts");

export class HostsService {
  #hosts: string[];
  #sudo: SudoService;

  constructor(domains: string[]) {
    this.#hosts = domains;
    this.#sudo = new SudoService();
  }

  #shell({ verbose }: SetupOptions) {
    return verbose ? verboseShell : silentShell;
  }

  async setup(options: SetupOptions) {
    logger.start("Setting up hosts");

    await this.#sudo.auth();

    const { $ } = this.#shell(options);

    await $`sudo hosts backups create`;

    for (const host of this.#hosts) {
      await this.addHost(host, options);
    }

    logger.success("Hosts ready");
  }

  async clean(options: SetupOptions) {
    await this.#sudo.auth();

    for (const host of this.#hosts) {
      await this.removeHost(host, options);
    }
  }

  async findHost(host: string) {
    const { exitCode } = await quietShell.$`hosts show "${host}"`.nothrow();
    const found = exitCode === 0;
    debug("Host %s is %s", host, found ? "present" : "absent");
    return found;
  }

  async addHost(host: string, options: SetupOptions) {
    const { $ } = this.#shell(options);

    const found = await this.findHost(host);

    if (!found) {
      await $`sudo hosts add 127.0.0.1 ${host}`;
    }
  }

  async removeHost(host: string, options: SetupOptions) {
    const { $ } = this.#shell(options);

    const found = await this.findHost(host);

    if (!found) {
      await $`sudo hosts remove ${host}`;
    }
  }
}
