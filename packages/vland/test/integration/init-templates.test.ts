import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, makeTmpDir } from "#test/helpers.ts";

const cli = createTestCli();

describe("vland init (template scaffolding)", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeTmpDir("init-templates");
  });

  afterEach(() => fixture.cleanup());

  test("library: replaces placeholders and sets the package name", async () => {
    const name = "my-lib";
    const r = cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    const pkg = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));
    expect(pkg.name).toBe(name);

    const license = await readFile(path.join(projectDir, "LICENSE"), "utf8");
    expect(license).not.toContain("{{");

    const readme = await readFile(path.join(projectDir, "README.md"), "utf8");
    expect(readme).toContain(name);
    expect(readme).not.toContain("{{");
  });

  test("backend: clears placeholders and wires the logger service name", async () => {
    const name = "my-api";
    const r = cli(`init ${name} -t backend --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    const pkg = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));
    expect(pkg.name).toBe(name);
    expect(pkg.dependencies).toMatchObject({ elysia: expect.any(String), evlog: expect.any(String) });

    const logger = await readFile(path.join(projectDir, "src", "logger.ts"), "utf8");
    expect(logger).toContain(`service: "${name}"`);
  });

  test("monorepo: rewrites workspace package names", async () => {
    const name = "my-mono";
    const r = cli(`init ${name} -t monorepo --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    const apiPkg = JSON.parse(await readFile(path.join(projectDir, "apps", "api", "package.json"), "utf8"));
    expect(apiPkg.name).toBe(`@${name}/api`);
    expect(apiPkg.dependencies).toMatchObject({ [`@${name}/types`]: "workspace:*" });

    const typesPkg = JSON.parse(await readFile(path.join(projectDir, "packages", "types", "package.json"), "utf8"));
    expect(typesPkg.name).toBe(`@${name}/types`);
  });

  test("refuses to overwrite a non-empty target dir without --force", () => {
    const name = "dup-lib";
    cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    const second = cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    expect(second.status).not.toBe(0);
    expect(second.stdout + second.stderr).toMatch(/--force/);
  });
});
