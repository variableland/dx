---
"@rrlab/astro-plugin": patch
---

In a monorepo, `rr tsc` and `rr check` run `astro check` only in the Astro packages, the ones with an `astro.config.*` or with `astro` in `dependencies`, `devDependencies` or `peerDependencies`, and `tsc --noEmit` in the other packages with a `tsconfig.json`. `astro check` used to run in every one of them, so in a plain TypeScript package it booted Astro, printed Vite warnings and wrote `.astro/` into the package. Such a package needs only `typescript`, and `rr tsc doctor` there checks `tsc`.
