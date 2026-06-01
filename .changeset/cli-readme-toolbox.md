---
"@rrlab/cli": patch
---

Refresh the README for the microkernel model.

Drop the stale, hand-maintained `Toolbox` section (it still listed `rimraf`, which isn't a plugin) and fold the tool list into the `Plugins` section as the single source of truth. The official plugins are now named there — `biome`, `oxc`, `ts`, `tsdown` — each linked to the tool it wraps, framed as capabilities added via plugins rather than a flat bag of tools.
