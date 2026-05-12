import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createTestCli, makeTmpDir } from "#test/helpers.ts";

const cli = createTestCli();

describe("vland init (install resolution)", () => {
  let fixture: { dir: string; cleanup: () => void };

  beforeEach(() => {
    fixture = makeTmpDir("init-install");
  });

  afterEach(() => fixture.cleanup());

  test("--no-install: skips and recommends `install && dev` next", () => {
    const r = cli("init install-off -t library --no-install --no-git", { cwd: fixture.dir });
    expect(r.status).toBe(0);
    const out = r.stdout + r.stderr;
    expect(out).toMatch(/Skipping.*install/);
    expect(out).toMatch(/install && pnpm dev/);
  });
});
