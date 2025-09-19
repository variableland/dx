import { afterEach, expect, test } from "bun:test";
import { createTestProgram, execCli, mocked } from "test/helpers";

const { program, ctx } = await createTestProgram();
const $ = ctx.shell.$;

const rootCommands = ["help", "--help", "--version", "-v"];

afterEach(() => {
  mocked($).mockClear();
});

test("should match all root commands", async () => {
  const results = await Promise.all(
    rootCommands.map(async (cmd) => {
      const { stdout } = await execCli(cmd);
      return { cmd, output: stdout };
    }),
  );

  for (const { cmd, output } of results) {
    expect(output).toMatchSnapshot(`root-command-${cmd}`);
  }
});

test("should match help messages for all commands", async () => {
  const results = await Promise.all(
    program.commands.map(async (command) => {
      const cmd = command.name();
      const { stdout } = await execCli(`${cmd} --help`);
      return { cmd, output: stdout };
    }),
  );

  for (const { cmd, output } of results) {
    expect(output).toMatchSnapshot(`help-command-${cmd}`);
  }
});
