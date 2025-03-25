import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ["text", "lcov", "text-summary"],
      include: ["src"],
    },
    setupFiles: ["./test/setup.ts"],
    alias: {
      "~/shell": "<rootDir>/__mocks__/~/shell.ts",
    },
    env: {
      // required to look the cli package.json up
      BIN_PATH: "./bin",
    },
  },
});
