---
"@rrlab/cli": patch
---

Render user-facing errors cleanly instead of dumping a raw Node stack trace.

Domain errors (e.g. a missing plugin for the requested capability) now print
just their message and exit 1, rather than the verbose
`MissingPluginError: …` + `at …` + `Node.js v…` uncaught-exception wall.
Unexpected errors still surface their full stack so genuine bugs stay
debuggable. Domain errors extend a shared `KnownError` base, and a top-level
handler in `run.ts` decides which treatment each gets.
