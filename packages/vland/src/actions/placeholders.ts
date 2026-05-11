import fs from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { createPkg } from "@vlandoss/clibuddy";
import { logger } from "#src/services/logger.ts";

export type Placeholders = {
  projectName: string;
  author: string;
  year: string;
};

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
  ".json",
  ".jsonc",
  ".md",
  ".mdx",
  ".yml",
  ".yaml",
  ".toml",
  ".css",
  ".html",
  ".sh",
  ".env",
  ".gitignore",
  ".gitattributes",
  ".npmrc",
  ".nvmrc",
  ".node-version",
  ".dockerignore",
  ".editorconfig",
  ".prettierrc",
]);

const TEXT_FILENAMES = new Set([
  "Dockerfile",
  "LICENSE",
  "README",
  "CHANGELOG",
  ".gitignore",
  ".gitattributes",
  ".npmrc",
  ".nvmrc",
  ".node-version",
  ".dockerignore",
  ".editorconfig",
  ".prettierrc",
  "lefthook.yml",
  "mise.toml",
]);

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".turbo", ".next", "build", "coverage"]);

function isTextFile(name: string) {
  if (TEXT_FILENAMES.has(name)) return true;
  return TEXT_EXTENSIONS.has(extname(name));
}

async function walk(root: string, onFile: (path: string) => Promise<void>) {
  const entries = await readdir(root, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const full = join(root, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) return;
        await walk(full, onFile);
        return;
      }
      if (entry.isFile()) {
        await onFile(full);
      }
    }),
  );
}

function applyPlaceholders(content: string, values: Placeholders) {
  return content
    .replaceAll("{{projectName}}", values.projectName)
    .replaceAll("{{author}}", values.author)
    .replaceAll("{{year}}", values.year);
}

export async function replacePlaceholders(rootDir: string, values: Placeholders) {
  const debug = logger.subdebug("placeholders");
  let touched = 0;

  await walk(rootDir, async (filePath) => {
    const name = filePath.split("/").pop() ?? "";
    if (!isTextFile(name)) return;

    const fileStat = await stat(filePath);
    if (fileStat.size > 1_000_000) return; // skip files >1MB; templates shouldn't have those

    const original = await readFile(filePath, "utf8");
    const replaced = applyPlaceholders(original, values);
    if (replaced !== original) {
      await writeFile(filePath, replaced);
      touched += 1;
    }
  });

  debug("placeholders applied to %d file(s)", touched);
  return { touched };
}

/**
 * Updates the root `package.json` `name` field via `pkg-types`. Safer than a
 * regex pass because it preserves field ordering and JSON formatting handled
 * by `pkg-types`.
 */
export async function updateRootPackageName(rootDir: string, projectName: string) {
  const debug = logger.subdebug("update-root-package-name");

  const rootPath = fs.realpathSync(rootDir);

  debug("root path:", rootPath);
  debug("process cwd:", process.cwd());

  const pkg = await createPkg(rootPath);

  if (!pkg) {
    throw new Error("Could not find package.json");
  }

  try {
    pkg.packageJson.name = projectName;
    await pkg.write(pkg.packageJson);
  } catch (error) {
    debug("skipped %s", error);
  }
}
