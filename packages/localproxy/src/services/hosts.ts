import { logger } from "./logger";
import { quietShell, silentShell, verboseShell } from "./shell";

type SetupOptions = {
  verbose: boolean;
  password: string;
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

  async #auth(password: string) {
    if (!password) {
      throw new Error("Password is required");
    }

    // Asking sudo directly in JS is unreliable,
    // so we do it through a shell command
    await silentShell.child({
      stdio: ["ignore", "ignore", "pipe"],
    }).$`echo "${password}" | sudo -S -v`;
  }

  async setup(options: SetupOptions) {
    await this.#auth(options.password);

    const { stdout } = await verboseShell.$`sudo hosts backups create`;
    const backupPath = stdout.match(/(\/[^\s]+)/)?.[1];
    debug("Backup created at %s", backupPath);

    for (const host of this.#hosts) {
      await this.addHost(host, options);
    }
  }

  async clean(options: SetupOptions) {
    await this.#auth(options.password);

    for (const host of this.#hosts) {
      await this.removeHost(host, options);
    }
  }

  async findHost(host: string) {
    const { exitCode } = await quietShell.$`hosts show "${host}"`.nothrow();
    debug("Host %s is %s", host, !exitCode ? "present" : "absent");
    return !exitCode;
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
