type SiteBlock = {
  sites: string[];
  directives: Directive[];
};

type Directive = {
  type: string;
  matchToken?: string;
  arguments: string[];
};

export type Caddyfile = {
  siteBlocks: SiteBlock[];
};

export class CaddyfileParser {
  #content: string;

  constructor(content: string) {
    this.#content = content;
  }

  parse(): Caddyfile {
    const siteBlocks = this.#extractSiteBlocks(this.#content);

    return {
      siteBlocks,
    };
  }

  #extractSiteBlocks(content: string) {
    const siteBlocks: SiteBlock[] = [];

    const bracedBlockRegex = /([^{]+)\s*\{([^}]*)\}/gs;

    let match: RegExpExecArray | null | undefined;
    const processedContent = new Set<string>();

    // biome-ignore lint/suspicious/noAssignInExpressions: loop over content
    while ((match = bracedBlockRegex.exec(content)) !== null) {
      const [fullMatch, sitesStr, directivesStr] = match;
      processedContent.add(fullMatch.trim());

      const sites = sitesStr ? this.#parseSites(sitesStr.trim()) : [];
      const directives = directivesStr ? this.#parseDirectives(directivesStr.trim()) : [];

      if (sites.length > 0) {
        siteBlocks.push({ sites, directives });
      }
    }

    return siteBlocks;
  }

  #parseSites(sitesStr: string) {
    if (!sitesStr.trim()) {
      return [];
    }

    return sitesStr
      .split(/[,\s]+/)
      .map((site) => site.trim())
      .filter((site) => site.length > 0);
  }

  #parseDirectives(directivesStr: string) {
    const directives: Directive[] = [];

    if (!directivesStr.trim()) {
      return directives;
    }

    // Split into lines and process each directive
    const lines = directivesStr
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    for (const line of lines) {
      const directive = this.#parseDirectiveLine(line);

      if (directive) {
        directives.push(directive);
      }
    }

    return directives;
  }

  #parseDirectiveLine(line: string): Directive | null {
    // Simple regex to parse: directive [matcher] arg1 arg2 ...
    const directiveRegex = /^(\w+)(?:\s+(.+))?$/;
    const match = line.match(directiveRegex);

    if (!match) {
      return null;
    }

    const [, directiveType, argsStr] = match;

    const directive: Directive = {
      type: directiveType as string,
      arguments: [],
    };

    if (argsStr) {
      const args = argsStr.split(/\s+/).filter((arg) => arg.length > 0);

      if (args.length > 0 && this.#looksLikeMatcher(args[0] as string)) {
        directive.matchToken = args[0];
        directive.arguments = args.slice(1);
      } else {
        directive.arguments = args;
      }
    }

    return directive;
  }

  #looksLikeMatcher(token: string) {
    return token === "*" || token.startsWith("/") || token.startsWith("@");
  }
}
