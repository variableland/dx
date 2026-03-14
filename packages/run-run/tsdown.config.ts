import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/lib/**/*.ts"],
  format: "esm",
  dts: true,
});
