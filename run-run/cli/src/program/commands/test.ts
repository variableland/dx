import { doctorOneAction } from "#src/actions/doctor.ts";
import { testAction } from "#src/actions/test.ts";
import type { ContextValue } from "#src/services/context.ts";
import { createCommand } from "../base.ts";

type ActionOptions = {
  env?: string;
};

export function createTestCommand(ctx: ContextValue) {
  return (
    createCommand("test")
      .addCapabilities(["test"])
      .summary("run the test suite")
      .description(
        "Passthrough to the configured test runner. Forwards every flag and argument (e.g. --project, --watch) — including --help — straight to the tool. Loads .env.test or .env by default. ('rr test doctor' is reserved for the health check.)",
      )
      // Pure passthrough: don't parse the tool's flags, don't capture --help.
      // `--env` is consumed only when it precedes the forwarded args. It's not
      // named `--env-file`: Node's early `--env-file` scanner would grab that
      // token off the `rr` process's argv before Commander ever sees it.
      .allowUnknownOption(true)
      .passThroughOptions(true)
      .helpOption(false)
      .option("--env <path>", "load this env file before running (default: .env.test, then .env)")
      .argument("[args...]", "arguments forwarded to the test runner")
      .action(async (args: string[] = [], options: ActionOptions = {}) => {
        const runner = ctx.plugins.getServiceOrThrow("test");
        await testAction({ ctx, runner, options: { envFile: options.env }, args });
      })
      .addDoctorCommand(async () => {
        const runner = ctx.plugins.getServiceOrThrow("test");
        await doctorOneAction({ ctx, service: runner });
      })
  );
}
