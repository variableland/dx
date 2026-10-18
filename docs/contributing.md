# Contributing

dx takes bug reports, fixes and small features for run-run, vland and their packages. To set up the repo and run its checks, see the [development guide](development.md).

## Issues

- A bug report says what you ran, what you expected, what happened, and which Node version and package versions you use. `DEBUG=run-run:*` or `DEBUG=vland:*` before the command prints the debug log.
- A new feature, a new plugin, or a change to a command, a template or the plugin contract starts as an issue before any pull request.

## Pull requests

1. Branch from `main` with a prefix: `feat/`, `fix/`, `docs/`, `ci/`, `chore/` or `test/`.
2. Write commits as [Conventional Commits](https://www.conventionalcommits.org), such as `fix(oxc-plugin): stop installing a flaky oxlint-tsgolint`. The pull request title takes the same form, because it becomes the squash commit.
3. A feature lands with a test of the happy path and at least one failure case, and a fix with a regression test.
4. Run `pnpm rr check` and `pnpm test` before you push.
5. A pull request from a `feat/` or `fix/` branch, or with the `preview` label, publishes a preview to npm, under the `pr-<number>` tag, of each package it changes and the packages that depend on them. The [development guide](development.md#preview-releases) shows how to install one.

CI has to pass, and a maintainer squash-merges.

## Changesets

A change to what a package ships to npm needs a changeset. Run `pnpm changeset`, pick the packages and the bump (`patch` for a fix, `minor` for a feature, `major` for a breaking change), and write one sentence for the changelog. Changes to tests, CI, `decisions/` or these docs need none.

The plugins take `@rrlab/cli` as a peer, and a changeset that bumps `@rrlab/cli` by `major` also lists every official plugin as `major`. [Decision 011](../decisions/011-cli-peer-bump-strategy.md) explains why.

Nobody edits versions or `CHANGELOG.md` by hand, and nobody publishes from a clone.

## Releases

When changesets land on `main`, the Release job opens or updates a "chore: update versions" pull request as `vland-bot`. A maintainer merges it, and the next run on `main` publishes each new version to npm, with npm trusted publishing, and tags it.

A new tag of a CLI regenerates the `CLI.md` of every CLI in the cli docs workflow, in a "chore: regenerate CLI docs" pull request, which a maintainer merges too.
