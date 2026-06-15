import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["./src/**/__tests__/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["./test/integration/**/*.test.ts"],
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
