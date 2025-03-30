#!/usr/bin/env bun
import { $ } from "bun";

async function main() {
  if (!Bun.env.PR_NUMBER) {
    throw new Error("PR_NUMBER environment variable is required");
  }

  if (!Bun.env.NPM_TOKEN) {
    throw new Error("NPM_TOKEN environment variable is required");
  }

  try {
    const shortGitSha = (await $`git rev-parse --short HEAD`.text()).trim();

    const preid = `git-${shortGitSha}`;

    await $`pnpm version prerelease --preid="${preid}" --no-git-tag-version`;
  } catch (error) {
    throw new Error("Failed to bump packages", { cause: error });
  }

  try {
    await Bun.write(".npmrc", `//registry.npmjs.org/:_authToken=${Bun.env.NPM_TOKEN}`);

    const tag = `pr-${Bun.env.PR_NUMBER}`;

    await $`pnpm publish -r --tag="${tag}" --no-git-checks`;
  } catch (error) {
    throw new Error("Failed to publish packages", { cause: error });
  }
}

main();
