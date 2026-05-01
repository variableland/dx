import { defineConfig, type UserConfig } from "tsdown";

export function defineBinConfig(options: UserConfig = {}) {
  return defineConfig({
    entry: ["src/main.ts"],
    format: "esm",
    ...options,
  });
}

export function defineLibConfig(options: UserConfig = {}) {
  return defineConfig({
    format: "esm",
    dts: true,
    ...options,
  });
}
