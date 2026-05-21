import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function dirnameOf(meta: ImportMeta): string {
  return meta.dirname ?? dirname(fileURLToPath(meta.url));
}

export function filenameOf(meta: ImportMeta): string {
  return meta.filename ?? fileURLToPath(meta.url);
}
