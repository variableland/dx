import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { createPkg, type Pkg } from "../pkg.ts";

let dir: string;

afterEach(() => rmSync(dir, { recursive: true, force: true }));

async function makePkg(files: Record<string, string>): Promise<Pkg> {
  dir = mkdtempSync(path.join(tmpdir(), "clibuddy-pkg-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
  const pkg = await createPkg(dir);
  if (!pkg) throw new Error("fixture has no package.json");
  return pkg;
}

const manifest = (fields: Record<string, unknown> = {}) => JSON.stringify({ name: "root", ...fields });
const app = { "apps/a/package.json": JSON.stringify({ name: "a" }) };

async function projectNames(pkg: Pkg) {
  return (await pkg.getWorkspaceProjects()).map((p) => p.manifest.name);
}

describe("Pkg workspaces", () => {
  test("a pnpm-workspace.yaml with packages is a workspace", async () => {
    const pkg = await makePkg({ "package.json": manifest(), "pnpm-workspace.yaml": "packages:\n  - apps/*\n", ...app });

    expect(pkg.isMonorepo()).toBe(true);
    expect(await projectNames(pkg)).toEqual(["a"]);
  });

  test("package.json workspaces is a workspace", async () => {
    const pkg = await makePkg({ "package.json": manifest({ workspaces: ["apps/*"] }), ...app });

    expect(pkg.isMonorepo()).toBe(true);
    expect(await projectNames(pkg)).toEqual(["a"]);
  });

  test("a settings-only pnpm-workspace.yaml is not a workspace", async () => {
    const pkg = await makePkg({ "package.json": manifest(), "pnpm-workspace.yaml": "minimumReleaseAge: 1440\n", ...app });

    expect(pkg.isMonorepo()).toBe(false);
    expect(await projectNames(pkg)).toEqual([]);
  });

  test("a pnpm-workspace.yaml whose packages only list the root is not a workspace", async () => {
    const pkg = await makePkg({ "package.json": manifest(), "pnpm-workspace.yaml": "packages:\n  - .\n", ...app });

    expect(pkg.isMonorepo()).toBe(false);
    expect(await projectNames(pkg)).toEqual([]);
  });

  test("a pnpm-workspace.yaml with the root and other packages is a workspace", async () => {
    const pkg = await makePkg({
      "package.json": manifest(),
      "pnpm-workspace.yaml": "packages:\n  - .\n  - apps/*\n",
      ...app,
    });

    expect(pkg.isMonorepo()).toBe(true);
    expect(await projectNames(pkg)).toEqual(["a"]);
  });

  test("a pnpm-workspace.yaml with empty packages is not a workspace", async () => {
    const pkg = await makePkg({ "package.json": manifest(), "pnpm-workspace.yaml": "packages: []\n" });

    expect(pkg.isMonorepo()).toBe(false);
  });

  test("a settings-only pnpm-workspace.yaml falls back to package.json workspaces", async () => {
    const pkg = await makePkg({
      "package.json": manifest({ workspaces: ["apps/*"] }),
      "pnpm-workspace.yaml": "minimumReleaseAge: 1440\n",
      ...app,
    });

    expect(pkg.isMonorepo()).toBe(true);
    expect(await projectNames(pkg)).toEqual(["a"]);
  });

  test("no workspace file is not a workspace", async () => {
    const pkg = await makePkg({ "package.json": manifest() });

    expect(pkg.isMonorepo()).toBe(false);
  });
});
