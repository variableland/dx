import biome from "@rrlab/biome-plugin";
import { defineConfig } from "@rrlab/cli/config";
import oxc from "@rrlab/oxc-plugin";
import tsdown from "@rrlab/tsdown-plugin";

export default defineConfig({
  plugins: [tsdown(), biome(), oxc({ only: ["tsc"] })],
});
