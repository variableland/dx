---
"@rrlab/tsdown-plugin": patch
---

`rr plugins add tsdown` adds `typescript` as a dev dependency, which tsdown needs to write the `lib` preset's declarations, unless the package already has it in `dependencies` or `devDependencies`. Before, `rr pack` failed with "TypeScript is not installed" in a project without the ts plugin. `rr plugins remove tsdown` keeps `typescript`.
