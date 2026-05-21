import { defineConfig } from "@rrlab/cli/config";
import biome from "@rrlab/plugin-biome";
import ts from "@rrlab/plugin-ts";
import tsdown from "@rrlab/plugin-tsdown";

export default defineConfig({
  plugins: [biome(), ts(), tsdown()],
});
