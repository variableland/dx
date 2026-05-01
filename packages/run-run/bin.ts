#!/usr/bin/env bun
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "./src/main";

main({
  binDir: dirname(fileURLToPath(import.meta.url)),
});
