import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, gitOutput, makeTmpDir, pathExists } from "#test/helpers.ts";

const cli = createTestCli();

describe("vland init (git initialisation)", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeTmpDir("init-git");
  });

  afterEach(() => fixture.cleanup());

  test("--git: creates a repo with the canonical first commit", async () => {
    const name = "git-on";
    const r = cli(`init ${name} -t library --no-install --git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);
    const combined = r.stdout + r.stderr;
    expect(combined).not.toMatch(/pathspec/i);
    expect(combined).not.toMatch(/Failed to initialise git/);

    const projectDir = path.join(fixture.dir, name);
    expect(pathExists(path.join(projectDir, ".git"))).toBe(true);
    expect(gitOutput(projectDir, ["log", "-1", "--pretty=%s"])).toBe("chore: initial commit from vland");
    expect(gitOutput(projectDir, ["rev-list", "--count", "HEAD"])).toBe("1");
  });

  test("defaults to git init in non-interactive runs when --no-git is omitted", async () => {
    const name = "git-default";
    const r = cli(`init ${name} -t library --no-install`, { cwd: fixture.dir });
    expect(r.status).toBe(0);
    expect(r.stdout + r.stderr).not.toMatch(/pathspec/i);

    const projectDir = path.join(fixture.dir, name);
    expect(pathExists(path.join(projectDir, ".git"))).toBe(true);
    expect(gitOutput(projectDir, ["log", "-1", "--pretty=%s"])).toBe("chore: initial commit from vland");
  });

  test("--no-git: skips and prints a Skipping note", async () => {
    const name = "git-off";
    const r = cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);
    expect(r.stdout + r.stderr).toMatch(/Skipping.*git init/);

    const projectDir = path.join(fixture.dir, name);
    expect(pathExists(path.join(projectDir, ".git"))).toBe(false);
  });
});
