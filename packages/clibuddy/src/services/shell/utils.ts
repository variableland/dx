import { ProcessOutput } from "zx";

export function isProcessOutput(value: unknown): value is ProcessOutput {
  return value instanceof ProcessOutput;
}
