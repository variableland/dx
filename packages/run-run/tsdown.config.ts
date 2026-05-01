import { defineBinConfig, defineLibConfig } from "@vlandoss/tsdown-config";
import { defineConfig } from "tsdown";

export default defineConfig([defineLibConfig({ entry: ["src/lib/**/*.ts"] }), defineBinConfig()]);
