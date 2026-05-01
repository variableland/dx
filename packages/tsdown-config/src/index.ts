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

export function defineBinConfig(options: object = {}) {
  return {
    entry: ["bin.ts"],
    format: "esm" as const,
    plugins: [nodeShebangPlugin()],
    ...options,
  };
}

export function defineLibConfig(options: object = {}) {
  return {
    format: "esm" as const,
    dts: true,
    ...options,
  };
}
