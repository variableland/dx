import * as fs from "node:fs/promises";
import path from "node:path";
import { editor as editorPrompt, password as passwordPrompt } from "@inquirer/prompts";
import { createCommand } from "commander";
import { CaddyService } from "~/services/caddy";
import { HostsService } from "~/services/hosts";
import { logger } from "~/services/logger";
import { quietShell } from "~/services/shell";
import type { Context } from "~/types";

type CommandOptions = {
  verbose: boolean;
};

const debug = logger.subdebug("setup");

async function printFile(filePath: string) {
  const fileContent = (await fs.readFile(filePath)).toString();

  console.log(`${filePath}:\n`);
  console.log(fileContent.trim());
}

async function checkInternalTools() {
  const { $ } = quietShell;

  const caddyVersion = await $`caddy --version`.nothrow();

  if (caddyVersion.exitCode) {
    logger.error("Caddy is not installed. Please install Caddy first:");
    logger.info("macOS: brew install caddy");
    logger.info("Linux: https://caddyserver.com/docs/install");
    process.exit(1);
  }

  debug("Caddy version: %s", caddyVersion.stdout.trim());

  const hostsVersion = await $`hosts --version`.nothrow();

  if (!hostsVersion) {
    logger.error("hosts CLI tool is not installed. Please install hosts first:");
    logger.info("macOS: brew tap xwmx/taps && brew install hosts");
    logger.info("Linux: Check https://github.com/xwmx/hosts for installation");
    process.exit(1);
  }

  debug("hosts version: %s", hostsVersion.stdout.trim());
}

export function createSetupCommand({ binDir, installDir, caddyfilePath }: Context) {
  return createCommand("setup")
    .description("setup config files")
    .option("--verbose", "verbose mode, show background output", false)
    .action(async (options: CommandOptions) => {
      debug("setup command options %o", options);

      await checkInternalTools();

      if (!(await fs.exists(installDir))) {
        await fs.mkdir(installDir);
      }

      const exampleCaddyFilePath = path.join(binDir, "config", "Caddyfile.example");
      const defaultContent = (await fs.exists(caddyfilePath))
        ? await fs.readFile(caddyfilePath, "utf-8")
        : await fs.readFile(exampleCaddyFilePath, "utf-8");

      const fileContent = await editorPrompt({
        message: "Caddyfile",
        default: defaultContent,
      });

      await fs.writeFile(caddyfilePath, fileContent);

      await printFile(caddyfilePath);

      const caddyService = new CaddyService(caddyfilePath);
      await caddyService.reboot(options);

      const localDomains = caddyService.getLocalDomains();
      const hosts = localDomains.map((d) => d.host);

      const password = await passwordPrompt({
        message: "sudo password to manage hosts",
      });

      const hostsService = new HostsService(hosts);
      await hostsService.setup({ ...options, password });

      logger.success("localproxy setup completed");
    });
}
