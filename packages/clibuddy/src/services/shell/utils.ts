import path from "node:path";
import { ProcessOutput } from "zx";

export function isProcessOutput(value: unknown): value is ProcessOutput {
  return value instanceof ProcessOutput;
}

const getLocalBinPath = (dirPath: string) => path.join(dirPath, "node_modules", ".bin");

export function getPreferLocal(localBaseBinPath: string | Array<string> | undefined) {
  return !localBaseBinPath
    ? undefined
    : Array.isArray(localBaseBinPath)
      ? localBaseBinPath.map(getLocalBinPath)
      : [localBaseBinPath].map(getLocalBinPath);
}
