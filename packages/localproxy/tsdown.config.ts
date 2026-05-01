import { defineConfig } from "tsdown";

function nodeShebang() {
  return {
    name: "node-shebang",
    renderChunk(code: string) {
      if (code.startsWith("#!/usr/bin/env bun")) {
        return code.replace("#!/usr/bin/env bun", "#!/usr/bin/env node");
      }
    },
  };
}

export default defineConfig({
  entry: ["bin.ts"],
  format: "esm",
  plugins: [nodeShebang()],
});
