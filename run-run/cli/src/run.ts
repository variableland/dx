import { createProgram } from "./program/index.ts";

const program = await createProgram(import.meta);

await program.run();
