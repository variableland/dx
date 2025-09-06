import * as fs from "node:fs/promises";
import { logger } from "../logger";
import { CaddyfileParser } from "./parser";

const debug = logger.subdebug("caddyfile-service");

export type LocalDomain = {
  hostname: string;
  ports: string[];
};

const LOCALHOST_REGEX = /localhost(:\d+)?/;

export class CaddyfileService {
  #filepath: string;

  constructor(filepath: string) {
    this.#filepath = filepath;
  }

  async getLocalDomains(): Promise<LocalDomain[]> {
    const caddyfileContent = await fs.readFile(this.#filepath, "utf-8");

    const caddyfileParser = new CaddyfileParser(caddyfileContent);

    const caddyfile = caddyfileParser.parse();

    const domains = caddyfile.siteBlocks.flatMap((block) => {
      const ports = block.directives
        .filter((d) => d.type === "reverse_proxy" && d.arguments.some((arg) => this.#isLocalhost(arg)))
        .flatMap((d) => d.arguments)
        .filter((arg) => this.#isLocalhost(arg))
        .map((arg) => arg.split(":")[1] as string);

      return block.sites.map((site) => {
        return { hostname: site, ports };
      });
    });

    debug("detected domains: %o", domains);

    return domains;
  }

  #isLocalhost(arg: string) {
    return LOCALHOST_REGEX.test(arg);
  }
}
