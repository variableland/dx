---
"@rrlab/biome-plugin": patch
"@rrlab/oxc-plugin": patch
---

Refresh stale install ranges in `oxc-plugin`'s `TOOL_VERSIONS` so `rr plugins add oxc` no longer pins users to old 0.x minors. `^0.X.Y` semver on 0.x packages only allows patch bumps — `oxfmt ^0.30.0` was strands at 0.30.x while upstream shipped through 0.51.0, and `oxlint-tsgolint ^0.15.0` strands at 0.15.x while upstream shipped 0.23.0.

- `oxfmt`: install `^0.30.0` → `^0.51.0`; devDep `0.35.0` → `0.51.0`.
- `oxlint-tsgolint`: install `^0.15.0` → `^0.23.0`; devDep `0.15.0` → `0.23.0`.
- `oxlint`: install stays `^1.0.0` (caret on 1.x already covers 1.66.x); devDep `1.50.0` → `1.66.0`.
- `@biomejs/biome`: install stays `^2.0.0` (caret on 2.x covers latest); devDep `2.4.4` → `2.4.15`.
