import { execCli } from "test/helpers";
import { expect, test } from "vitest";

test("should display help message with --help", async () => {
  const { stdout } = await execCli("--help");

  expect(stdout).toMatchSnapshot();
});

test("should display help message with help subcommand", async () => {
  const { stdout } = await execCli("help");

  expect(stdout).toMatchSnapshot();
});
