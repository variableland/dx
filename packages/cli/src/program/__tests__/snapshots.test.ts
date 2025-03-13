import { createTestProgram, execCli, parseProgram } from "test/helpers";
import { expect, test, vi } from "vitest";
import { $ } from "~/shell";

const { program } = createTestProgram();

const rootCommands = ["help", "--help"];

for (const cmd of rootCommands) {
  test(`should match ${cmd}`, async () => {
    const { stdout } = await execCli(cmd);

    expect(stdout).toMatchSnapshot();
  });
}

for (const command of program.commands) {
  const cmd = command.name();

  test(`should match help message for ${cmd}`, async () => {
    const { stdout } = await execCli(`${cmd} --help`);

    expect(stdout).toMatchSnapshot();
  });

  test(`should match ${cmd} command`, async () => {
    await parseProgram([cmd]);

    expect(vi.mocked($)).toBeCalledTimes(1);
    expect(vi.mocked($).mock.results[0]?.value).toMatchSnapshot();
  });
}
