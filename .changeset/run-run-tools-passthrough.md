---
"@vlandoss/run-run": patch
---

Stop swallowing flags passed to the `tools` shims.

`rr` defines `-v/--version`, `-h/--help` and `--usage` at the root level. By default Commander accepts those flags anywhere in the argv, so invocations like `rr tools biome --version` (or the published `biome` shim, which delegates to `rr tools biome "$@"`) were resolved by the root parser and printed rr's own version/help instead of forwarding to the underlying tool.

Enabling `enablePositionalOptions()` on the root program and `passThroughOptions()` on the `tools` command keeps the root flags scoped to the root, so anything after `rr tools <bin>` is forwarded verbatim to the wrapped binary. Same applies to the `oxfmt`, `oxlint` and `tsdown` shims.
