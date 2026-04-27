---
"@vlandoss/clibuddy": patch
"@vlandoss/localproxy": patch
"@vlandoss/loggy": patch
"@vlandoss/run-run": patch
"@vlandoss/starter": patch
---

Switch tsconfigs to `@vlandoss/config/ts/*` and move path aliases from tsconfig `paths` to the `package.json` `imports` field (`#src/*`, `#test/*`). Relative imports now use explicit `.ts` extensions.
