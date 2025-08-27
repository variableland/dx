import * as fs from "node:fs";
import path from "node:path";
import { logger } from "./logger";
import { quietShell, silentShell, verboseShell } from "./shell";

const debug = logger.subdebug("caddy");

type ExecOption = {
  verbose: boolean;
};

export type LocalDomain = {
  host: string;
  port: string;
};

export class CaddyService {
  #configPath: string;
  #pidFilePath: string;

  constructor(configPath: string) {
    this.#configPath = configPath;
    this.#pidFilePath = path.join(path.dirname(configPath), "caddy.pid");
    this.#initCaddyPid();
  }

  #initCaddyPid() {
    if (!this.#hasCaddyPid()) {
      fs.writeFileSync(this.#pidFilePath, "");
    }
  }

  #hasCaddyPid() {
    return fs.existsSync(this.#pidFilePath);
  }

  #deleteCaddyPid() {
    if (this.#hasCaddyPid()) {
      fs.rmSync(this.#pidFilePath);
    }
  }

  #shell({ verbose }: ExecOption) {
    return verbose ? verboseShell : silentShell;
  }

  async reboot(options: ExecOption) {
    const isRunning = await this.isRunning();
    if (isRunning) {
      await this.stop(options);
    }
    await this.start(options);
  }

  async start({ verbose }: ExecOption) {
    const { $ } = this.#shell({ verbose });

    try {
      logger.start("Starting Caddy");

      await $`caddy start -c ${this.#configPath} --pidfile ${this.#pidFilePath} > /dev/null 2>&1`;

      logger.success("Caddy started");
    } catch {
      logger.error("Can't start Caddy");
      process.exit(1);
    }
  }

  async stop({ verbose }: ExecOption) {
    const { $ } = this.#shell({ verbose });

    try {
      logger.start("Stopping Caddy");

      await $`caddy stop -c ${this.#configPath}`;
      this.#deleteCaddyPid();

      logger.success("Caddy stopped");
    } catch {
      logger.error("Can't stop Caddy");
      process.exit(1);
    }
  }

  async isRunning() {
    if (!this.#hasCaddyPid()) {
      return false;
    }

    const pid = (await quietShell.$`cat ${this.#pidFilePath}`.text()).trim();

    debug("Caddy PID: %d", pid);

    const { exitCode } = await quietShell.$`kill -0 ${pid}`.nothrow();
    const isRunning = exitCode === 0;

    debug("Caddy is %s", isRunning ? "running" : "stopped");

    return isRunning;
  }

  getLocalDomains(): LocalDomain[] {
    const caddyfileContent = fs.readFileSync(this.#configPath, "utf-8");

    const REGEX = /^(.+)\.localhost/gm;
    const matches = caddyfileContent.matchAll(REGEX);

    const hosts = Array.from(matches, (m) => m[0]).filter(Boolean) as string[];

    const localDomains: LocalDomain[] = hosts.map((host) => {
      const index = caddyfileContent.indexOf(host);
      const port = caddyfileContent.slice(index).match(/localhost:(\d+)/)?.[1] || "80";
      return { host, port };
    });

    debug("detected domains: %o", localDomains);

    return localDomains;
  }
}
