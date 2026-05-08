#!/usr/bin/env node
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "./src/main.ts";

main({
  binDir: dirname(fileURLToPath(import.meta.url)),
});

// test preview
