---
"@rrlab/cli": patch
---

`rr plugins add` and `rr plugins remove` leave a JSON config file as it is when the plugin's edits change nothing in it, as with `rr plugins add biome --force` or `rr plugins add ts --force` on a file that already has them: the file stays byte-identical, and the output says "No changes for …". It used to be rewritten with a 2-space indent and each array item on its own line, so `rr check` failed on it.
