import { defineConfig, type UserConfig } from "tsdown";

export function nodeShebangPlugin() {
  return {
    name: "node-shebang",
    renderChunk(code: string) {
      if (code.startsWith("#!/usr/bin/env bun")) {
        return code.replace("#!/usr/bin/env bun", "#!/usr/bin/env node");
      }
    },
  };
}

export function defineBinConfig(options: UserConfig = {}) {
  return defineConfig({
    entry: ["bin.ts"],
    format: "esm",
    plugins: [nodeShebangPlugin()],
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
