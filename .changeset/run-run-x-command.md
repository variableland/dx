---
"@vlandoss/run-run": minor
---

Replace the implicit `rr <cmd1> <cmd2>` parallel syntax with an explicit `rr x <cmd1> <cmd2>` subcommand. The previous form was ambiguous — there was no way to tell whether the user wanted a subcommand with positional args or to fan out multiple subcommands. **Breaking:** `rr jsc tsc` no longer runs both concurrently; use `rr x jsc tsc` instead.
