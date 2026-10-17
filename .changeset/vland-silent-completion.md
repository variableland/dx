---
"@variablelab/vland": patch
---

Guard the shell completion rc lines shown by the README and `vland completion --help` with `command -v vland` and discard their stderr, so a shell without `vland`, or with only a mise shim for it, starts without errors.
