import * as fs from "node:fs/promises";
import path from "node:path";
import { editor as editorPrompt } from "@inquirer/prompts";
import { createCommand } from "commander";
import { CaddyService } from "#/services/caddy";
import { CaddyfileService } from "#/services/caddyfile";
import { FileService } from "#/services/file";
import { HostsService } from "#/services/hosts";
import { logger } from "#/services/logger";
import { quietShell } from "#/services/shell";
import type { Context } from "#/types";

type CommandOptions = {
  verbose: boolean;
};

const debug = logger.subdebug("setup");

async function checkInternalTools() {
  const { $ } = quietShell;

  const caddyVersion = await $`caddy --version`.nothrow();

  if (caddyVersion.exitCode) {
    logger.error("Caddy is not installed. Please install Caddy first:");
    logger.info("macOS: brew install caddy");
    logger.info("Linux: https://caddyserver.com/docs/install");
    process.exit(1);
  }

  debug("caddy version: %s", caddyVersion.stdout.trim());

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
    .action(async function setupAction(options: CommandOptions) {
      const { verbose } = options;

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

      const fileService = new FileService(caddyfilePath);
      await fileService.print();

      const caddyService = new CaddyService(caddyfilePath);
      await caddyService.reboot({ verbose });

      const caddyfileService = new CaddyfileService(caddyfilePath);
      const localDomains = await caddyfileService.getLocalDomains();
      const hostnames = localDomains.map((d) => d.hostname);

      const hostsService = new HostsService();
      await hostsService.setup({ verbose, hostnames });

      logger.success("Setup completed!");
    });
}
