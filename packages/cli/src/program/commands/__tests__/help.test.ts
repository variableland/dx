import { test, expect } from "vitest";
import { execCli } from "test/helpers";

test("should display help message with --help", async () => {
  const { stdout } = await execCli("--help");

  expect(stdout).toMatchSnapshot();
});

test("should display help message with help subcommand", async () => {
  const { stdout } = await execCli("help");

  expect(stdout).toMatchSnapshot();
});
