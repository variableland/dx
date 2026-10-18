---
"@rrlab/biome-plugin": patch
---

`rr plugins add biome` on a project that already has a `biome.json` formats the patched file with the installed Biome, so `rr jsc`, `rr format` and `rr check` pass on it. It used to leave the file with a 2-space indent and every array item on its own line, including arrays it didn't touch, which Biome's format check rejects. If Biome can't format the file, it's left as patched and `rr plugins add` still succeeds.
