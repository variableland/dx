import { existsSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createShellService } from "@variablelab/clibuddy";
import { satisfies } from "semver";
import { afterEach, describe, expect, it } from "vitest";
import { AstroCheckService, isAstroProject } from "../index.ts";

// These run the real `astro check` against a tmp Astro project, so they are slow.
const TIMEOUT = 60_000;
const PLUGIN_NODE_MODULES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../node_modules");

// astro refuses to start on a Node older than its own `engines.node` (astro 7 needs a
// newer one than this repo's floor), so the tests that run it are skipped there. The
// missing-dependency tests and those of a package without Astro never start astro, so
// they run everywhere.
const astroPkg = JSON.parse(readFileSync(path.join(PLUGIN_NODE_MODULES, "astro/package.json"), "utf8")) as {
  version: string;
  engines: { node: string };
};
const ASTRO_RUNS = satisfies(process.versions.node, astroPkg.engines.node);

const CLEAN_PAGE = `---\nconst answer: number = 42;\n---\n<p>{answer}</p>\n`;
const BROKEN_PAGE = `---\nconst answer: number = "forty-two";\n---\n<p>{answer}</p>\n`;
const CLEAN_TS = "export const ok: number = 1;\n";
const BROKEN_TS = 'export const bad: number = "not a number";\n';
const ALL_DEPS = ["astro", "@astrojs/check", "typescript"];

const manifest = (fields: Record<string, unknown> = {}) =>
  `${JSON.stringify({ name: "astro-fixture", private: true, type: "module", ...fields })}\n`;
// A plain TS package's tsconfig: nothing from astro to extend.
const PLAIN_TSCONFIG = `${JSON.stringify({
  compilerOptions: { target: "es2022", module: "esnext", moduleResolution: "bundler", strict: true, noEmit: true },
  include: ["src"],
})}\n`;

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tmpDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

/**
 * A minimal Astro project shaped like www (`astro` in its dependencies, the
 * `astro/tsconfigs/strict` preset, `.astro/types.d.ts` included). Its
 * node_modules links the given packages from this plugin's own devDependencies,
 * so `astro check` resolves them from the project root as it would in a host
 * project.
 */
function makeProject(files: Record<string, string>, deps = ALL_DEPS) {
  return makeDir(
    {
      "package.json": manifest({ dependencies: { astro: astroPkg.version } }),
      "tsconfig.json": `${JSON.stringify({ extends: "astro/tsconfigs/strict", include: [".astro/types.d.ts", "**/*"] })}\n`,
      ...files,
    },
    deps,
  );
}

/** A plain TS package, as a monorepo has next to its Astro app: no `astro` dependency, no `astro.config.*`. */
function makePackage(files: Record<string, string>, deps = ["typescript"]) {
  return makeDir({ "package.json": manifest(), "tsconfig.json": PLAIN_TSCONFIG, ...files }, deps);
}

async function makeDir(files: Record<string, string>, deps: string[] = []) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "rr-astro-plugin-"));
  tmpDirs.push(tmpDir);
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(tmpDir, rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content);
  }
  for (const dep of deps) {
    const link = path.join(tmpDir, "node_modules", dep);
    await fs.mkdir(path.dirname(link), { recursive: true });
    await fs.symlink(await fs.realpath(path.join(PLUGIN_NODE_MODULES, dep)), link, "dir");
  }
  return tmpDir;
}

function service(cwd: string) {
  return new AstroCheckService(createShellService({ cwd }), cwd);
}

describe("isAstroProject()", () => {
  it.each(["dependencies", "devDependencies", "peerDependencies"])("is true with astro in %s", async (field) => {
    const dir = await makeDir({ "package.json": manifest({ [field]: { astro: "^7.0.0" } }) });
    expect(await isAstroProject(dir)).toBe(true);
  });

  it.each(["mjs", "js", "ts", "mts", "cjs", "cts"])("is true with an astro.config.%s and no astro dependency", async (ext) => {
    const dir = await makeDir({ "package.json": manifest(), [`astro.config.${ext}`]: "export default {};\n" });
    expect(await isAstroProject(dir)).toBe(true);
  });

  it("is false with neither", async () => {
    const dir = await makeDir({ "package.json": manifest({ dependencies: { react: "^19.0.0" } }) });
    expect(await isAstroProject(dir)).toBe(false);
  });

  it("reads the package's own manifest, not its workspace root's", async () => {
    const root = await makeDir({
      "package.json": manifest({ devDependencies: { astro: "^7.0.0" } }),
      "packages/lib/package.json": manifest(),
    });
    expect(await isAstroProject(path.join(root, "packages/lib"))).toBe(false);
  });

  it.each([
    ["missing", {}],
    ["malformed", { "package.json": "{ not json" }],
    ["not an object", { "package.json": "null\n" }],
  ])("is false when package.json is %s", async (_, files: Record<string, string>) => {
    const dir = await makeDir(files);
    expect(await isAstroProject(dir)).toBe(false);
  });
});

describe("AstroCheckService.check()", () => {
  it.runIf(ASTRO_RUNS)(
    "passes on a project without type errors",
    async () => {
      const cwd = await makeProject({ "src/pages/index.astro": CLEAN_PAGE, "src/lib/ok.ts": CLEAN_TS });
      const report = await service(cwd).check({ cwd });
      expect(report.ok, report.output).toBe(true);
      expect(report.output).toContain("$ astro check");
    },
    TIMEOUT,
  );

  it.runIf(ASTRO_RUNS)(
    "fails with astro check's diagnostic for a type error in a .astro file",
    async () => {
      const cwd = await makeProject({ "src/pages/index.astro": BROKEN_PAGE, "src/lib/ok.ts": CLEAN_TS });
      const report = await service(cwd).check({ cwd });
      expect(report.ok).toBe(false);
      expect(report.output).toContain("src/pages/index.astro");
      expect(report.output).toMatch(/Type 'string' is not assignable to type 'number'/);
    },
    TIMEOUT,
  );

  it.runIf(ASTRO_RUNS)(
    "fails for a type error in a plain .ts file too",
    async () => {
      const cwd = await makeProject({ "src/pages/index.astro": CLEAN_PAGE, "src/lib/bad.ts": BROKEN_TS });
      const report = await service(cwd).check({ cwd });
      expect(report.ok).toBe(false);
      expect(report.output).toContain("src/lib/bad.ts");
      expect(report.output).toMatch(/Type 'string' is not assignable to type 'number'/);
    },
    TIMEOUT,
  );

  it.runIf(ASTRO_RUNS)(
    "runs astro check in a component library, with astro as a peer dependency and no config",
    async () => {
      // tsc can't check a .astro file (no inputs), so a library without a config still needs astro check.
      const cwd = await makeProject({
        "package.json": manifest({ peerDependencies: { astro: ">=5.0.0" } }),
        "src/Button.astro": BROKEN_PAGE,
      });
      const report = await service(cwd).check({ cwd });
      expect(report.ok).toBe(false);
      expect(report.output).toContain("$ astro check");
      expect(report.output).toContain("src/Button.astro");
    },
    TIMEOUT,
  );

  it.runIf(ASTRO_RUNS)(
    "runs astro check in a project with an astro.config but no astro dependency of its own",
    async () => {
      // As in a monorepo app whose `astro` is hoisted to the workspace root.
      const cwd = await makeProject({
        "package.json": manifest(),
        "astro.config.mjs": "export default {};\n",
        "src/pages/index.astro": CLEAN_PAGE,
      });
      const report = await service(cwd).check({ cwd });
      expect(report.ok, report.output).toBe(true);
      expect(report.output).toContain("$ astro check");
    },
    TIMEOUT,
  );

  it(
    "runs tsc, not astro check, in a package without Astro",
    async () => {
      // A monorepo's plain TS package, where astro's deps resolve as they do once hoisted. astro check
      // ran there, booted Astro, warned about Vite and wrote `.astro/` into the package.
      const cwd = await makePackage({ "src/bad.ts": BROKEN_TS }, ALL_DEPS);
      const report = await service(cwd).check({ cwd });
      expect(report.ok).toBe(false);
      expect(report.output).toContain("$ tsc --noEmit --pretty");
      expect(report.output).not.toContain("$ astro check");
      expect(report.output).toContain("src/bad.ts");
      expect(report.output).toMatch(/Type 'string' is not assignable to type 'number'/);
      expect(existsSync(path.join(cwd, ".astro"))).toBe(false);
    },
    TIMEOUT,
  );

  it(
    "passes a package without Astro and without type errors",
    async () => {
      const cwd = await makePackage({ "src/ok.ts": CLEAN_TS });
      const report = await service(cwd).check({ cwd });
      expect(report.ok, report.output).toBe(true);
      expect(report.output).toContain("$ tsc --noEmit --pretty");
    },
    TIMEOUT,
  );

  it("fails naming only typescript when a package without Astro can't resolve it", async () => {
    const cwd = await makePackage({ "src/ok.ts": CLEAN_TS }, []);
    const report = await service(cwd).check({ cwd });
    expect(report.ok).toBe(false);
    expect(report.output).toMatchInlineSnapshot(
      `"@rrlab/astro-plugin requires typescript to be installed in the host project. Run: rr plugins add astro  (or: pnpm add -D typescript)"`,
    );
  });

  it("fails without running astro when @astrojs/check is missing", async () => {
    // Left to itself, astro would prompt to install it: a hang under capture, a false pass without stdin.
    const cwd = await makeProject({ "src/pages/index.astro": BROKEN_PAGE }, ["astro", "typescript"]);
    const report = await service(cwd).check({ cwd });
    expect(report.ok).toBe(false);
    expect(report.output).not.toContain("$ astro check");
    expect(report.output).toMatchInlineSnapshot(
      `"@rrlab/astro-plugin requires @astrojs/check to be installed in the host project. Run: rr plugins add astro  (or: pnpm add -D @astrojs/check)"`,
    );
  });
});

describe("AstroCheckService.doctor()", () => {
  it.runIf(ASTRO_RUNS)("reports healthy when astro check's dependencies resolve", async () => {
    const cwd = await makeProject({});
    const report = await service(cwd).doctor();
    expect(report.ok, report.output).toBe(true);
  });

  it("fails when they don't", async () => {
    const cwd = await makeProject({}, ["astro"]);
    const report = await service(cwd).doctor();
    expect(report.ok).toBe(false);
    expect(report.output).toContain("requires @astrojs/check, typescript to be installed");
  });

  it("checks tsc, the checker it runs there, in a package without Astro", async () => {
    const cwd = await makePackage({});
    const report = await service(cwd).doctor();
    expect(report.ok, report.output).toBe(true);
    expect(report.output).toContain("$ tsc --help");
  });

  it("asks only for typescript in a package without Astro", async () => {
    const cwd = await makePackage({}, []);
    const report = await service(cwd).doctor();
    expect(report.ok).toBe(false);
    expect(report.output).toContain("requires typescript to be installed");
    expect(report.output).not.toContain("@astrojs/check");
  });

  it("checks the package it's given, not the one rr runs in", async () => {
    // `rr tsc doctor` at a workspace root hands it each package `rr tsc` checks.
    const root = await makeProject({}, ["astro"]);
    const pkg = await makePackage({});
    const report = await service(root).doctor({ cwd: pkg });
    expect(report.ok, report.output).toBe(true);
    expect(report.output).toContain("$ tsc --help");
  });

  it("fails for a package it's given that can't run its checker, wherever rr runs", async () => {
    const root = await makeProject({});
    const pkg = await makeProject({}, ["astro"]);
    const report = await service(root).doctor({ cwd: pkg });
    expect(report.ok).toBe(false);
    expect(report.output).toContain("requires @astrojs/check, typescript to be installed");
  });
});
