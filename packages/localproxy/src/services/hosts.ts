import { logger } from "./logger";
import { quietShell, silentShell, verboseShell } from "./shell";

type SetupOptions = {
  verbose: boolean;
};

const debug = logger.subdebug("hosts");

export class HostsService {
  #hosts: string[];

  constructor(domains: string[]) {
    this.#hosts = domains;
  }

  #shell({ verbose }: SetupOptions) {
    return verbose ? verboseShell : silentShell;
  }

  async setup(options: SetupOptions) {
    verboseShell.$`sudo hosts backups create`;

    for (const host of this.#hosts) {
      await this.addHost(host, options);
    }
  }

  async clean(options: SetupOptions) {
    for (const host of this.#hosts) {
      await this.removeHost(host, options);
    }
  }

  async findHost(host: string) {
    const currentHost = await quietShell.$`hosts show "${host}"`.text();
    debug("Host %s is %s", host, currentHost ? "present" : "absent");
    return currentHost;
  }

  async addHost(host: string, options: SetupOptions) {
    const { $ } = this.#shell(options);

    const currentHost = await this.findHost(host);

    if (!currentHost) {
      await $`sudo hosts add 127.0.0.1 ${host}`;
    }
  }

  async removeHost(host: string, options: SetupOptions) {
    const { $ } = this.#shell(options);

    const currentHost = await this.findHost(host);

    if (!currentHost) {
      await $`sudo hosts remove ${host}`;
    }
  }
}
