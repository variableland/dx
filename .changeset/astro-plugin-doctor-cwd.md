---
"@rrlab/astro-plugin": patch
---

`rr tsc doctor` looks for what `astro check` needs, `@astrojs/check` and `typescript`, in each package it checks instead of the directory `rr` was started from. Run at a monorepo root, it used to look for them there, and reported them missing when only the Astro package had them.
