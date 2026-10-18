---
"@variablelab/vland": patch
---

`vland init -t monorepo` no longer ships Changesets (`.changeset/` and the `@changesets/*` devDependencies). Every package in the monorepo is private and it has no release workflow, so Changesets had nothing to version or publish. Only the `library` template ships ready to publish to npm.
