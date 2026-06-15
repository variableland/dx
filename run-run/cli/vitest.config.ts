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
          // Integration tests spawn the real `rr` bin against a tmp fixture and
          // run actual toolchains (tsc, biome, oxlint), so they're far slower
          // than the 5s default — and slower still on contended CI runners.
          // A generous per-test/hook budget keeps them from timing out flakily.
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
