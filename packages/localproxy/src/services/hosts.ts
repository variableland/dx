import { logger } from "./logger";
import { quietShell, silentShell, verboseShell } from "./shell";
import { SudoService } from "./sudo";

type SetupOptions = {
  verbose: boolean;
  hostnames: string[];
};

type Host = {
  ip: string;
  hostname: string;
};

const debug = logger.subdebug("hosts");

export class HostsService {
  #sudo: SudoService;

  constructor() {
    this.#sudo = new SudoService();
  }

  #shell({ verbose }: SetupOptions) {
    return verbose ? verboseShell : silentShell;
  }

  async setup(options: SetupOptions) {
    const { hostnames } = options;

    logger.start("Setting up hosts");

    await this.#sudo.auth();

    const { $ } = this.#shell(options);

    await $`sudo hosts backups create`;

    for (const host of hostnames) {
      await this.addHost(host, options);
    }

    logger.success("Hosts ready");
  }

  async clean(options: SetupOptions) {
    const { hostnames } = options;

    await this.#sudo.auth();

    for (const host of hostnames) {
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

  async getEnabledHosts(): Promise<Host[]> {
    const output = await quietShell.$`hosts list enabled`.text();

    const hosts = output
      .split("\n")
      .map((line) => {
        const [ip, hostname] = line.split(/\s+/);

        if (!ip || !hostname) {
          return null;
        }

        return { ip, hostname };
      })
      .filter(Boolean);

    return hosts as Host[];
  }
}
