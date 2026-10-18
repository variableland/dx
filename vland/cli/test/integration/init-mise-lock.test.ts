import { spawnSync } from "node:child_process";
import { mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { TEMPLATES, type TemplateName } from "#src/actions/template.ts";
import { createTestCli, makeTmpDir, miseLockedCheck, TEMPLATES_DIR } from "#test/helpers.ts";

const cli = createTestCli();

// The generated CI runs on ubuntu-latest, so mise.lock has to lock linux-x64.
const CI_PLATFORM = "linux-x64";

// A machine without mise skips the tests that run it. dx's CI sets mise up, so they run there.
const HAS_MISE = spawnSync("mise", ["--version"]).status === 0;

type LockedVersion = { specifiers: string[]; urls: Set<string> };

/**
 * Reads the `[[tools.<name>]]` entries of a mise.lock: the requests each one
 * locks and the platforms it has a url for. `platforms` holds every platform
 * the lock has a table for, plus CI's.
 */
function readLock(miseLock: string) {
  const tools = new Map<string, LockedVersion[]>();
  const platforms = new Set([CI_PLATFORM]);
  let locked: LockedVersion | undefined;
  let platform: string | undefined;

  for (const line of miseLock.split("\n")) {
    const entry = line.match(/^\[\[tools\.([\w-]+)\]\]$/);
    const table = line.match(/^\[tools\.([\w-]+)\."platforms\.([\w-]+)"\]$/);
    if (entry) {
      const tool = entry[1] ?? "";
      locked = { specifiers: [], urls: new Set() };
      tools.set(tool, [...(tools.get(tool) ?? []), locked]);
      platform = undefined;
    } else if (table) {
      // A platform table belongs to the last `[[tools.<name>]]` entry above it.
      locked = tools.get(table[1] ?? "")?.at(-1);
      platform = table[2] ?? "";
      platforms.add(platform);
    } else if (line.startsWith("[")) {
      locked = undefined;
    } else if (locked && !platform && line.startsWith("specifiers = ")) {
      locked.specifiers = [...line.matchAll(/"([^"]*)"/g)].map((match) => match[1] ?? "");
    } else if (locked && platform && line.startsWith("url = ")) {
      locked.urls.add(platform);
    }
  }

  return { tools, platforms };
}

/**
 * Lists what `mise install --locked` would miss, on any platform the lock
 * covers or CI's: each `[tools]` request of mise.toml that mise.lock doesn't
 * lock, or locks without a url for one of those platforms.
 */
function lockGaps(miseToml: string, miseLock: string): string[] {
  const { tools, platforms } = readLock(miseLock);
  const gaps: string[] = [];
  let section: string | undefined;

  for (const line of miseToml.split("\n")) {
    const header = line.match(/^\[(.+)\]$/);
    if (header) {
      section = header[1];
      continue;
    }
    if (section !== "tools" || line.trim() === "" || line.startsWith("#")) continue;

    const request = line.match(/^([\w-]+) = "([^"]+)"$/);
    if (!request) {
      gaps.push(`mise.toml has a [tools] line this check can't read: ${line}`);
      continue;
    }
    const tool = request[1] ?? "";
    const version = request[2] ?? "";
    const locked = tools.get(tool)?.find((entry) => entry.specifiers.includes(version));
    if (!locked) {
      gaps.push(`${tool}@${version} is not in mise.lock`);
      continue;
    }
    for (const missing of [...platforms].filter((name) => !locked.urls.has(name))) {
      gaps.push(`${tool}@${version} has no url for ${missing} in mise.lock`);
    }
  }

  return gaps;
}

function readTemplateFile(template: TemplateName, file: string): Promise<string> {
  return readFile(path.join(TEMPLATES_DIR, template, file), "utf8");
}

describe("vland init (mise lock)", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeTmpDir("init-mise-lock");
  });

  afterEach(() => fixture.cleanup());

  test.each(TEMPLATES)("%s: ships the template's mise.lock, which locks every mise.toml tool", async (template) => {
    const name = `lock-${template}`;
    const r = cli(`init ${name} -t ${template} --no-install --no-git`, { cwd: fixture.dir });
    expect(r.status).toBe(0);

    const projectDir = path.join(fixture.dir, name);
    const miseLock = await readFile(path.join(projectDir, "mise.lock"), "utf8");
    expect(miseLock).toBe(await readTemplateFile(template, "mise.lock"));

    // After a change to a template's mise.toml, `mise lock` in that template's directory fixes this.
    const miseToml = await readFile(path.join(projectDir, "mise.toml"), "utf8");
    expect(lockGaps(miseToml, miseLock)).toEqual([]);
  });

  test("the lock check reports a mise.toml request that mise.lock doesn't lock", async () => {
    const miseToml = await readTemplateFile("library", "mise.toml");
    const miseLock = await readTemplateFile("library", "mise.lock");

    const drifted = miseToml.replace(/^pnpm = ".+"$/m, 'pnpm = "0.0.0"');
    expect(lockGaps(drifted, miseLock)).toEqual(["pnpm@0.0.0 is not in mise.lock"]);
  });

  test("the lock check reports a platform that a locked tool has no url for", async () => {
    const miseToml = await readTemplateFile("library", "mise.toml");
    const miseLock = await readTemplateFile("library", "mise.lock");

    const drifted = miseLock.replace(/(\[tools\.node\."platforms\.linux-x64"\]\n(?:.+\n)*?)url = .+\n/, "$1");
    expect(lockGaps(miseToml, drifted)).toEqual([expect.stringMatching(/^node@\S+ has no url for linux-x64 in mise.lock$/)]);
  });

  test("library: init needs no mise and still ships the template's mise.lock", async () => {
    // A PATH with node and the system tools bin/ needs (bash, dirname, readlink), but no mise.
    const bin = path.join(fixture.dir, "bin");
    await mkdir(bin);
    await symlink(process.execPath, path.join(bin, "node"));
    const PATH = [bin, "/usr/bin", "/bin"].join(path.delimiter);
    expect(spawnSync("/bin/sh", ["-c", "command -v mise"], { env: { PATH } }).status).not.toBe(0);

    const r = cli("init no-mise -t library --no-install --no-git", { cwd: fixture.dir, env: { PATH } });
    expect(r.status, r.stdout + r.stderr).toBe(0);

    const miseLock = await readFile(path.join(fixture.dir, "no-mise", "mise.lock"), "utf8");
    expect(miseLock).toBe(await readTemplateFile("library", "mise.lock"));
  });

  describe.runIf(HAS_MISE)("with mise", () => {
    test.each(TEMPLATES)("%s: `mise install --locked` resolves every tool from the shipped mise.lock", (template) => {
      const name = `locked-${template}`;
      const r = cli(`init ${name} -t ${template} --no-install --no-git`, { cwd: fixture.dir });
      expect(r.status).toBe(0);

      const check = miseLockedCheck(path.join(fixture.dir, name));
      expect(check.status, check.stdout + check.stderr).toBe(0);
    });

    test("library: `mise install --locked` fails on a mise.toml request that mise.lock doesn't lock", async () => {
      const name = "drifted";
      const r = cli(`init ${name} -t library --no-install --no-git`, { cwd: fixture.dir });
      expect(r.status).toBe(0);

      const projectDir = path.join(fixture.dir, name);
      const miseTomlPath = path.join(projectDir, "mise.toml");
      const miseToml = await readFile(miseTomlPath, "utf8");
      await writeFile(miseTomlPath, miseToml.replace(/^pnpm = ".+"$/m, 'pnpm = "0.0.0"'));

      const check = miseLockedCheck(projectDir);
      expect(check.status).toBe(1);
      expect(check.stderr).toContain("pnpm@0.0.0 is not in the lockfile");
    });
  });
});
