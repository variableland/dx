import * as fs from "node:fs";
import path from "node:path";
import { logger } from "./logger";
import { quietShell, silentShell, verboseShell } from "./shell";

const debug = logger.subdebug("caddy");

type ExecOption = {
  verbose: boolean;
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

  #getPID() {
    return this.#hasCaddyPid() ? fs.readFileSync(this.#pidFilePath, "utf-8").trim() : null;
  }

  async reboot(options: ExecOption) {
    const isRunning = await this.isRunning();
    if (isRunning) {
      await this.stop(options);
    }
    await this.start(options);
  }

  async start({ verbose }: ExecOption) {
    if (await this.isRunning()) {
      logger.warn("Caddy is already running. PID: %d", this.#getPID());
      return;
    }

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

    const pid = this.#getPID();

    debug("caddy PID: %d", pid);

    const { exitCode } = await quietShell.$`kill -0 ${pid}`.nothrow();
    const isRunning = exitCode === 0;

    debug("caddy is %s", isRunning ? "running" : "stopped");

    return isRunning;
  }
}
