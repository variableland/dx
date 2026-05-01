#!/usr/bin/env node
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "./dist/main.mjs";

main({
  binDir: dirname(fileURLToPath(import.meta.url)),
});
