import { afterEach, expect, test } from "bun:test";
import { createTestProgram, execCli, mocked, parseProgram } from "test/helpers";

const { cmd, ctx } = await createTestProgram();
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

for (const command of cmd.commands) {
  const cmd = command.name();

  test(`should match help message for command "${cmd}"`, async () => {
    const { stdout } = await execCli(`${cmd} --help`);

    expect(stdout).toMatchSnapshot();
  });
}

// these command don't use shell ($) instance
const hardCommands = ["info:pkg", "clean"];

const easyTesteableCommands = cmd.commands.filter((command) => {
  const isHard = hardCommands.some((cmd) => command.name() === cmd);
  return !isHard;
});

for (const command of easyTesteableCommands) {
  const cmd = command.name();

  test(`should match "${cmd}" command`, async () => {
    await parseProgram([cmd]);

    expect($).toHaveBeenCalledTimes(1);
    expect(mocked($).mock.results[0]?.value).toMatchSnapshot();
  });
}
