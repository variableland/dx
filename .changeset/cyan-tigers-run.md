---
"@vlandoss/config": minor
"@vlandoss/run-run": patch
"@vlandoss/localproxy": patch
"@vlandoss/starter": patch
---

Upgrade TypeScript to 6.0.3 and enforce explicit `.ts` import extensions

- Upgrade TypeScript from 5.9.3 to 6.0.3 across the monorepo
- Add `useImportExtensions: "error"` biome rule to enforce explicit `.ts` extensions in all imports
- Add `@types/node` as optional peer dependency in `@vlandoss/config`
- Add `types: ["node"]` to the `tsconfig.no-dom` base config
- Update all import paths in `localproxy` and `starter` to use explicit `.ts` extensions
- Remove root-level `tsconfig.json` (paths now handled per-package)
