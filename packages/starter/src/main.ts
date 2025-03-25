import fs from "node:fs";
import { Log } from "@variableland/console";
import { runPlop } from "./run-plop";

async function main() {
  if (!process.env.BIN_PATH) {
    throw new Error("Required BIN_PATH env var");
  }

  try {
    const binPath = fs.realpathSync(process.env.BIN_PATH);

    await runPlop({
      cwd: binPath,
      dest: process.cwd(),
    });
  } catch (error) {
    Log.error("Failed to run plop", error);
    process.exit(1);
  }
}

main();
