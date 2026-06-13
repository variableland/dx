import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, makeTmpDir, pathExists } from "#test/helpers.ts";

const cli = createTestCli();

describe("vland init (template scaffolding)", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeTmpDir("init-templates");
  });

  afterEach(() => fixture.cleanup());

  test("library: defaults to the public @vlandoss scope when --visibility is omitted", async () => {
    const name = "my-lib";
    const r = cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    const pkg = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));
    expect(pkg.name).toBe(`@vlandoss/${name}`);
    expect(pkg.private).toBeUndefined();
    expect(pkg.devDependencies).toMatchObject({ "@rrlab/cli": expect.any(String) });

    const license = await readFile(path.join(projectDir, "LICENSE"), "utf8");
    expect(license).not.toContain("{{");

    const readme = await readFile(path.join(projectDir, "README.md"), "utf8");
    expect(readme).toContain(name);
    expect(readme).not.toContain("{{");
  });

  test("library: --visibility=private uses @variableland scope and sets private:true", async () => {
    const name = "env";
    const r = cli(`init ${name} -t library --visibility=private --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const pkg = JSON.parse(await readFile(path.join(fixture.dir, name, "package.json"), "utf8"));
    expect(pkg.name).toBe(`@variableland/${name}`);
    expect(pkg.private).toBe(true);
  });

  test("library: --visibility=public uses @vlandoss scope and no private flag", async () => {
    const name = "env";
    const r = cli(`init ${name} -t library --visibility=public --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const pkg = JSON.parse(await readFile(path.join(fixture.dir, name, "package.json"), "utf8"));
    expect(pkg.name).toBe(`@vlandoss/${name}`);
    expect(pkg.private).toBeUndefined();
  });

  test("library: ships an empty run-run.config.mts and no per-tool config files", async () => {
    const name = "my-lib";
    const r = cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    expect(pathExists(path.join(projectDir, "run-run.config.mts"))).toBe(true);
    expect(pathExists(path.join(projectDir, "biome.json"))).toBe(false);
    expect(pathExists(path.join(projectDir, "tsconfig.json"))).toBe(false);
    expect(pathExists(path.join(projectDir, "tsdown.config.ts"))).toBe(false);

    const rrConfig = await readFile(path.join(projectDir, "run-run.config.mts"), "utf8");
    expect(rrConfig).toContain("@rrlab/cli/config");
    expect(rrConfig).toMatch(/plugins:\s*\[\]/);
  });

  test("library: package.json scripts don't wrap rr commands", async () => {
    const name = "my-lib";
    const r = cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const pkg = JSON.parse(await readFile(path.join(fixture.dir, name, "package.json"), "utf8"));
    const scriptNames = Object.keys(pkg.scripts ?? {});
    expect(scriptNames).not.toContain("lint");
    expect(scriptNames).not.toContain("lint:fix");
    expect(scriptNames).not.toContain("tscheck");
    expect(scriptNames).not.toContain("check");
    expect(scriptNames).not.toContain("build");
  });

  test("backend: clears placeholders, sets private:true, wires the logger service name", async () => {
    const name = "assets";
    const r = cli(`init ${name} -t backend --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    const pkg = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));
    expect(pkg.name).toBe(name);
    expect(pkg.private).toBe(true);
    expect(pkg.dependencies).toMatchObject({ elysia: expect.any(String), evlog: expect.any(String) });

    const logger = await readFile(path.join(projectDir, "src", "logger.ts"), "utf8");
    expect(logger).toContain(`service: "${name}"`);
  });

  test("monorepo: bare-name apps and scoped packages, with private:true at root", async () => {
    const name = "yoppy";
    const r = cli(`init ${name} -t monorepo --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    const rootPkg = JSON.parse(await readFile(path.join(projectDir, "package.json"), "utf8"));
    expect(rootPkg.name).toBe(name);
    expect(rootPkg.private).toBe(true);

    const apiPkg = JSON.parse(await readFile(path.join(projectDir, "apps", "api", "package.json"), "utf8"));
    expect(apiPkg.name).toBe(`${name}-api`);
    expect(apiPkg.dependencies).toMatchObject({ [`@${name}/types`]: "workspace:*" });

    const webPkg = JSON.parse(await readFile(path.join(projectDir, "apps", "web", "package.json"), "utf8"));
    expect(webPkg.name).toBe(`${name}-web`);

    const typesPkg = JSON.parse(await readFile(path.join(projectDir, "packages", "types", "package.json"), "utf8"));
    expect(typesPkg.name).toBe(`@${name}/types`);
  });

  test("monorepo: ships an empty run-run.config.mts at root and in each workspace", async () => {
    const name = "my-mono";
    const r = cli(`init ${name} -t monorepo --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    for (const dir of ["", "apps/api", "apps/web", "packages/types"]) {
      const cfg = path.join(projectDir, dir, "run-run.config.mts");
      expect(pathExists(cfg), `expected ${cfg} to exist`).toBe(true);
      const body = await readFile(cfg, "utf8");
      expect(body).toMatch(/plugins:\s*\[\]/);
    }
  });

  test("refuses to overwrite a non-empty target dir without --force", () => {
    const name = "dup-lib";
    cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    const second = cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    expect(second.status).not.toBe(0);
    expect(second.stdout + second.stderr).toMatch(/--force/);
  });
});
