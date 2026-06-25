import type { InstallContext, UninstallContext } from "@rrlab/cli/plugin";
import { describe, expect, it } from "vitest";
import { install, TOOL_VERSIONS, uninstall } from "../index.ts";

// The vitest plugin is a pure passthrough: install/uninstall don't scaffold any
// config, they only ensure the vitest peer is added/removed. The hooks ignore
// their context, so a bare cast is enough at the test boundary.
const noopInstallCtx = {} as InstallContext;
const noopUninstallCtx = {} as UninstallContext;

describe("@rrlab/vitest-plugin install()", () => {
  it("adds vitest as a devDependency and scaffolds no files", async () => {
    const result = await install(noopInstallCtx);
    expect(result.devDependencies).toEqual({ vitest: TOOL_VERSIONS.vitest.install });
    expect(result.files).toBeUndefined();
  });
});

describe("@rrlab/vitest-plugin uninstall()", () => {
  it("removes vitest and touches no files", async () => {
    const result = await uninstall(noopUninstallCtx);
    expect(result.removeDependencies).toEqual(["vitest"]);
    expect(result.files).toBeUndefined();
  });
});
