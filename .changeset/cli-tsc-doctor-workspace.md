---
"@rrlab/cli": minor
---

`rr tsc doctor` checks the packages `rr tsc` checks. In a monorepo it runs the health check in each workspace package with a `tsconfig.json`, one row per package, instead of once at the workspace root, which `rr tsc` never checks. The other `doctor` commands and `rr doctor` run in the package they report on, the one with the nearest `package.json`, instead of the directory `rr` was started from. Plugins get that package as `doctor({ cwd })`, typed by the new `DoctorOptions`.
