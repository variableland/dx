---
"@vlandoss/run-run": minor
---

Add `rr completion <shell>` for shell autocomplete (bash, zsh, fish), powered by [`usage`](https://usage.jdx.dev). The `rr` bin became a small bash dispatcher so the completion fast path skips Node startup entirely (~10ms cold).
