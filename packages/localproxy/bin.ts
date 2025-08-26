#!/usr/bin/env bun
import { homedir } from "node:os";
import path from "node:path";
import { main } from "./src/main";

main({
  binDir: __dirname,
  installDir: path.join(homedir(), ".localproxy"),
});
