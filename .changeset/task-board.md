---
"@vlandoss/clibuddy": minor
---

Add `runTaskBoard`: a TTY-aware parallel task board. It runs N labelled tasks concurrently and renders one live spinner row each — collapsing to ✔/✖ with a duration — then flushes their captured output (dimmed on pass, full brightness on fail, capped with a `+N more lines` note) and a one-line summary. Non-TTY/CI prints each row once in input order, so logs stay deterministic. The `┌ │ └` frame is opt-in via `frame: true` (to divide composed sections); otherwise a lone task renders compactly and a multi-row run as a plain title + rows + summary. Glyphs mirror `@clack/prompts` (the `◒◐◓◑` spinner and gray `│ ┌ └` gutter). Also adds `palette.error`.
