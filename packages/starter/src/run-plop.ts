import path from "node:path";
import { Log } from "@variableland/console";
import { Plop, run } from "plop";

type PlopType = typeof Plop;
type PrepareOptions = Parameters<PlopType["prepare"]>[0];
type RunOptions = Parameters<typeof run>[0];

interface RunPlopOptions {
  cwd: string;
  dest: string;
}

const d = Log.subdebug("run-plop");

export function runPlop(options: RunPlopOptions) {
  const { cwd, dest } = options;

  const prepareOptions: PrepareOptions = {
    cwd,
    configPath: path.join(cwd, "plopfiles/plopfile.js"),
  };

  d("prepare options %O", prepareOptions);

  return new Promise((resolve, reject) => {
    Plop.prepare(prepareOptions, (env) => {
      Plop.execute(env, (env) => {
        const runOptions: RunOptions = {
          ...env,
          // @ts-expect-error
          dest,
        };

        d("run options %O", runOptions);

        run(runOptions, undefined, true).then(resolve, reject);
      });
    });
  });
}
