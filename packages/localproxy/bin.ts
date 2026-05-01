#!/usr/bin/env bun
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "./src/main";

main({
  binDir: path.dirname(fileURLToPath(import.meta.url)),
  installDir: path.join(homedir(), ".localproxy"),
});
