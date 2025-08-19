import { afterEach, expect, test } from "bun:test";
import { createTestProgram, execCli, mocked } from "test/helpers";

const { program, ctx } = await createTestProgram();
const $ = ctx.shell.$;

const rootCommands = ["help", "--help", "--version", "-v"];

afterEach(() => {
  mocked($).mockClear();
});

for (const cmd of rootCommands) {
  test(`should match command: "${cmd}"`, async () => {
    const { stdout } = await execCli(cmd);

    expect(stdout).toMatchSnapshot();
  });
}

for (const command of program.commands) {
  const cmd = command.name();

  test(`should match help message for command "${cmd}"`, async () => {
    const { stdout } = await execCli(`${cmd} --help`);

    expect(stdout).toMatchSnapshot();
  });
}
