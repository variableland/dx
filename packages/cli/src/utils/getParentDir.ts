import path from "path";

export function getParentDir(anyPath: string) {
  const segments = path.normalize(anyPath).split(path.sep);
  return segments[0] === "" ? segments[1] : segments[0];
}
