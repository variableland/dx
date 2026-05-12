---
"@vlandoss/vland": minor
---

`vland init` now prompts (default-yes) for installing dependencies and initialising a git repository when those flags aren't passed on the CLI. Use `--install` / `--no-install` and `--git` / `--no-git` to skip the prompts; in non-interactive contexts both default to `true`.

Also fixes the git initialisation step: the commit message was being split on whitespace by the underlying shell layer, producing errors like `pathspec 'initial' did not match any file(s)` and leaving the repo half-initialised. The migration to `tinyexec` (via `@vlandoss/clibuddy`) makes each argv entry survive as a separate token, so the canonical first commit `chore: initial commit from vland` now lands cleanly.
