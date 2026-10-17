---
"@rrlab/oxc-plugin": patch
---

`rr plugins add oxc` installs `oxlint-tsgolint@^7.0.2004`, and the peer range now starts at `>=0.24.0`. `oxlint-tsgolint@0.23.0` bundles a typescript-go whose macOS `realpath` can fail under concurrency, so `rr tsc` reports random `TS2307` on installed modules ([microsoft/typescript-go#4060](https://github.com/microsoft/typescript-go/issues/4060)). The new install range also matches the `>=7.0.2003` peer that current `oxlint` requires.
