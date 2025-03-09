import { expect, test, vi } from "vitest";
import { parseProgram, execCli } from "test/helpers";
import { $ } from "~/shell";

test("should display help message", async () => {
  const { stdout } = await execCli("lint --help");

  expect(stdout).toMatchSnapshot();
});

test("should run lint command", async () => {
  await parseProgram(["lint"]);

  expect(vi.mocked($)).toBeCalledTimes(1);
  expect(vi.mocked($).mock.results[0]?.value).toMatchInlineSnapshot(
    `"biome lint --no-errors-on-unmatched --colors=force"`,
  );
});

test("should run lint command with --fix flag", async () => {
  await parseProgram(["lint", "--fix"]);

  expect(vi.mocked($)).toBeCalledTimes(1);

  expect(vi.mocked($).mock.results[0]?.value).toMatchInlineSnapshot(
    `"biome lint --no-errors-on-unmatched --colors=force --fix"`,
  );
});
