#!/usr/bin/env bun
// This bin script is intended to be used from the monorepo root directory
// as well as from the installed /bin directory
Bun.env.BIN_PATH = __dirname;

if (Bun.env.ENV === "dev") {
  await import("./src/main");
} else {
  // @ts-expect-error - only available after build
  await import("./dist/main");
}
