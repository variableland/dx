import path from "node:path";
import { Plop, run } from "plop";
import { Log } from "~/logger";

type PlopType = typeof Plop;
type PrepareOptions = Parameters<PlopType["prepare"]>[0];
type RunOptions = Parameters<typeof run>[0];

interface RunPlopOptions {
  rrPath: string;
  dest: string;
}

const d = Log.subdebug("run-plop");

export function runPlop(options: RunPlopOptions) {
  const { rrPath, dest } = options;

  const prepareOptions: PrepareOptions = {
    cwd: rrPath,
    configPath: path.join(rrPath, "plopfiles/plopfile.js"),
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
