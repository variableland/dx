import { cp } from "node:fs/promises";
import { resolve } from "node:path";
import { downloadTemplate } from "giget";
import { logger } from "#src/services/logger.ts";

export const TEMPLATES = ["library", "backend", "monorepo"] as const;
export type TemplateName = (typeof TEMPLATES)[number];

const GITHUB_SOURCE = "github:variableland/dx";
const GITHUB_REF = "main";

type ResolveOptions = {
  template: TemplateName;
  dir: string;
  force: boolean;
};

/**
 * Resolves the template into `dir`. Source order:
 * 1. `VLAND_TEMPLATES_DIR` env var → copy from local path (used by E2E tests
 *    against the in-repo `templates/`).
 * 2. Otherwise → download via giget from `github:variableland/dx/templates/<name>`.
 */
export async function fetchTemplate(options: ResolveOptions): Promise<{ source: string }> {
  const debug = logger.subdebug("fetch-template");
  const localRoot = process.env.VLAND_TEMPLATES_DIR;

  if (localRoot) {
    const sourceDir = resolve(localRoot, options.template);
    debug("local source: %s", sourceDir);
    await cp(sourceDir, options.dir, {
      recursive: true,
      force: options.force,
      errorOnExist: !options.force,
      filter: (src) => !src.includes("/node_modules") && !src.endsWith("/.turbo") && !src.endsWith("/dist"),
    });
    return { source: sourceDir };
  }

  const source = `${GITHUB_SOURCE}/templates/${options.template}#${GITHUB_REF}`;
  debug("remote source: %s", source);
  const result = await downloadTemplate(source, {
    dir: options.dir,
    force: options.force,
    install: false,
  });
  return { source: result.source };
}
