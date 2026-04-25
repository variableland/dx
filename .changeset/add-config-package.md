---
"@vlandoss/config": minor
---

Introduce `@vlandoss/config`, a shared configuration package for `@variableland` tooling. Ships initial presets for Biome (`@vlandoss/config/biome`) and TypeScript (`@vlandoss/config/ts/*`) behind subpath exports, with room to add more (e.g. lefthook) over time. Supersedes `@vlandoss/biome-config`, which is now soft-deprecated but still published. `@biomejs/biome` is declared as an optional peer dependency so consumers only install it when using the Biome preset.
