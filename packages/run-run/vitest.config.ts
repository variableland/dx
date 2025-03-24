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
      "~/logger": "<rootDir>/__mocks__/~/logger.ts",
    },
    env: {
      // required to look the cli package.json up
      RR_BIN_PATH: "./bin",
    },
  },
});
