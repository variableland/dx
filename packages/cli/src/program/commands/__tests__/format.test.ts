import { expect, test, vi } from "vitest";
import { parseProgram, execCli } from "test/helpers";
import { $ } from "~/shell";

test("should display help message", async () => {
  const { stdout } = await execCli("format --help");

  expect(stdout).toMatchSnapshot();
});

test("should run format command with --check by default", async () => {
  await parseProgram(["format"]);

  expect(vi.mocked($)).toBeCalledTimes(1);
  expect(vi.mocked($).mock.results[0]?.value).toMatchInlineSnapshot(
    `"biome format --no-errors-on-unmatched --colors=force"`,
  );
});

test("should run format command with alias", async () => {
  await parseProgram(["fmt"]);

  expect(vi.mocked($)).toBeCalledTimes(1);
  expect(vi.mocked($).mock.results[0]?.value).toMatchInlineSnapshot(
    `"biome format --no-errors-on-unmatched --colors=force"`,
  );
});

test("should run format command with --fix flag", async () => {
  await parseProgram(["format", "--fix"]);

  expect(vi.mocked($)).toBeCalledTimes(1);

  expect(vi.mocked($).mock.results[0]?.value).toMatchInlineSnapshot(
    `"biome format --no-errors-on-unmatched --colors=force --fix"`,
  );
});

test("should run format command with --staged flag", async () => {
  await parseProgram(["format", "--fix-staged"]);

  expect(vi.mocked($)).toBeCalledTimes(1);

  expect(vi.mocked($).mock.results[0]?.value).toMatchInlineSnapshot(
    `"biome format --no-errors-on-unmatched --colors=force --fix --staged"`,
  );
});
