import { createProgram } from "./program";

async function main(argv = process.argv) {
  const program = createProgram();
  await program.parseAsync(argv);
}

main();
