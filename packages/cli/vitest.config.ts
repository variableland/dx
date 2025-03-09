import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ["text", "lcov"],
      exclude: ["__mocks__", "helpers", "test", "src/shell.ts", "src/main.ts"],
    },
    setupFiles: ["./test/setup.ts"],
    alias: {
      "~/shell": "<rootDir>/__mocks__/~/shell.ts",
    },
  },
});
