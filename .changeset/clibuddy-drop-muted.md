---
"@vlandoss/clibuddy": patch
"@vlandoss/vland": patch
---

Drop the `muted` token from `palette` and route its callers through `palette.dim`.

`muted` (a fixed `#a8afb5` gray) overlapped with `dim` for the secondary-text role it was used in (`$` command prefix, `v<version>`, the `vland init` "Next steps" / source path). Consolidating on `dim` keeps a single secondary tone and lets it follow the terminal's dim attribute. `@vlandoss/vland`'s banner, `--usage` hint, and `init` output move to `dim` accordingly.
