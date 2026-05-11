import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..", "..", "..");
const TEMPLATES_DIR = path.join(REPO_ROOT, "templates");
const VLAND_BIN = path.join(REPO_ROOT, "packages", "vland", "bin");

// Same shape as run-run/test/helpers.ts: spawnSync with NODE_ENV=production,
// TEST cleared, NO_COLOR=1 so assertions don't depend on terminal capability.
function runVland(cwd: string, args: string[]) {
  return spawnSync(VLAND_BIN, args, {
    encoding: "utf8",
    cwd,
    env: {
      ...process.env,
      NODE_ENV: "production",
      TEST: undefined,
      NO_COLOR: "1",
      VLAND_TEMPLATES_DIR: TEMPLATES_DIR,
    },
  });
}

describe("vland init (against local templates/)", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(path.join(tmpdir(), "vland-it-"));
  });

  afterEach(async () => {
    if (tmp) await rm(tmp, { recursive: true, force: true });
  });

  it("scaffolds a library with placeholders replaced and the package name set", async () => {
    const projectName = "my-lib";
    const result = runVland(tmp, ["init", projectName, "-t", "library", "--no-install", "--no-git"]);
    expect(result.status).toBe(0);

    const projectDir = path.join(tmp, projectName);
    await expect(stat(projectDir)).resolves.toMatchObject({});

    const pkg = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));
    expect(pkg.name).toBe(projectName);

    // Placeholders are replaced everywhere
    const license = await readFile(path.join(projectDir, "LICENSE"), "utf8");
    expect(license).not.toContain("{{");

    const readme = await readFile(path.join(projectDir, "README.md"), "utf8");
    expect(readme).toContain(projectName);
    expect(readme).not.toContain("{{");
  });

  it("fails clearly on a non-empty target dir without --force", () => {
    const projectName = "dup-lib";
    runVland(tmp, ["init", projectName, "-t", "library", "--no-install", "--no-git"]);
    const second = runVland(tmp, ["init", projectName, "-t", "library", "--no-install", "--no-git"]);
    expect(second.status).not.toBe(0);
    expect(second.stdout + second.stderr).toMatch(/--force/);
  });

  it("scaffolds a backend template with all placeholders cleared", async () => {
    const projectName = "my-api";
    const result = runVland(tmp, ["init", projectName, "-t", "backend", "--no-install", "--no-git"]);
    expect(result.status).toBe(0);

    const projectDir = path.join(tmp, projectName);
    const pkg = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));
    expect(pkg.name).toBe(projectName);
    expect(pkg.dependencies).toMatchObject({ elysia: expect.any(String), evlog: expect.any(String) });

    const logger = await readFile(path.join(projectDir, "src", "logger.ts"), "utf8");
    expect(logger).toContain(`service: "${projectName}"`);
  });

  it("scaffolds a monorepo with workspace package names rewritten", async () => {
    const projectName = "my-mono";
    const result = runVland(tmp, ["init", projectName, "-t", "monorepo", "--no-install", "--no-git"]);
    expect(result.status).toBe(0);

    const projectDir = path.join(tmp, projectName);
    const apiPkg = JSON.parse(await readFile(path.join(projectDir, "apps", "api", "package.json"), "utf8"));
    expect(apiPkg.name).toBe(`@${projectName}/api`);
    expect(apiPkg.dependencies).toMatchObject({ [`@${projectName}/types`]: "workspace:*" });

    const typesPkg = JSON.parse(await readFile(path.join(projectDir, "packages", "types", "package.json"), "utf8"));
    expect(typesPkg.name).toBe(`@${projectName}/types`);
  });
});
