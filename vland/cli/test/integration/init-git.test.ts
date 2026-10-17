import { writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, gitOutput, makeTmpDir, pathExists } from "#test/helpers.ts";

const cli = createTestCli();

/**
 * Points git at `gitconfig` alone (no system or real global config) and drops
 * the identity env vars, which outrank any config.
 */
function isolatedGitEnv(gitconfig: string): NodeJS.ProcessEnv {
  return {
    GIT_CONFIG_GLOBAL: gitconfig,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_NAME: undefined,
    GIT_AUTHOR_EMAIL: undefined,
    GIT_COMMITTER_NAME: undefined,
    GIT_COMMITTER_EMAIL: undefined,
  };
}

const LAST_COMMIT_IDENTITY = ["log", "-1", "--format=%an <%ae> | %cn <%ce>"];

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

  test("commits as the user's git identity when one is configured", () => {
    const gitconfig = path.join(fixture.dir, "gitconfig");
    writeFileSync(gitconfig, "[user]\n\tname = Jane Doe\n\temail = jane@example.com\n");

    const name = "git-identity";
    const r = cli(`init ${name} -t library --no-install --git`, { cwd: fixture.dir, env: isolatedGitEnv(gitconfig) });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    expect(gitOutput(projectDir, LAST_COMMIT_IDENTITY)).toBe("Jane Doe <jane@example.com> | Jane Doe <jane@example.com>");
  });

  test("falls back to the vland identity when git has none configured", () => {
    const gitconfig = path.join(fixture.dir, "gitconfig");
    writeFileSync(gitconfig, "");

    const name = "git-no-identity";
    const r = cli(`init ${name} -t library --no-install --git`, { cwd: fixture.dir, env: isolatedGitEnv(gitconfig) });
    expect(r.status).toBe(0);
    expect(r.stdout + r.stderr).not.toMatch(/Failed to initialise git/);

    const projectDir = path.join(fixture.dir, name);
    expect(gitOutput(projectDir, LAST_COMMIT_IDENTITY)).toBe("vland <noreply@variable.land> | vland <noreply@variable.land>");
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
