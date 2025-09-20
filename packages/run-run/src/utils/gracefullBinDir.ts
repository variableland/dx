import fs from "node:fs";
import path from "node:path";
import { logger } from "#/services/logger";

export function gracefullBinDir(binPathResolver: () => string) {
  try {
    const binPath = binPathResolver();
    const isDir = fs.statSync(binPath).isDirectory();
    return isDir ? binPath : path.dirname(binPath);
  } catch (error) {
    logger.error("Error getting bin directory:", error);
    process.exit(1);
  }
}
