import { type Options, createProgram } from "./program";
import { console } from "./services/console";

export async function main(options: Options) {
  try {
    const program = await createProgram(options);
    await program.parseAsync();
  } catch (error) {
    console.error("Cannot run main successfully", error);
    process.exit(1);
  }
}
