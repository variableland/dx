import { defineBinConfig, defineLibConfig } from "@rrlab/tsdown-config";
import { defineConfig } from "tsdown";

// biome-ignore format: I prefer multiple lines for readability
export default defineConfig([
  defineLibConfig({ entry: ["src/lib/**/*.ts"] }),
  defineBinConfig()
]);
