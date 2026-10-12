---
"@variablelab/vland": patch
---

Renamed from `@vlandoss/vland`. The CLI moved to the `withvariablelab/dx`
repository and is now published as `@variablelab/vland` (the `vland` binary is
unchanged). `vland init -t library` with public visibility (the default) now
scaffolds `@variablelab/<name>` instead of `@vlandoss/<name>`, and templates are
downloaded from `github:withvariablelab/dx`.
