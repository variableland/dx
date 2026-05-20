import type { Pkg } from "@vlandoss/clibuddy";
import type { PackageManager } from "nypm";
import { describe, expect, it } from "vitest";
import {
  describeWorkspaceChoice,
  resolveWorkspaceChoice,
  toNypmWorkspace,
  type WorkspaceChoice,
} from "#src/services/workspace-target.ts";

function stubPkg(monorepo: boolean): Pkg {
  return { isMonorepo: () => monorepo } as unknown as Pkg;
}

const pnpm: PackageManager = { name: "pnpm", command: "pnpm" };
const npm: PackageManager = { name: "npm", command: "npm" };
const yarn1: PackageManager = { name: "yarn", command: "yarn", majorVersion: "1" };
const yarn2: PackageManager = { name: "yarn", command: "yarn", majorVersion: "3" };

describe("resolveWorkspaceChoice", () => {
  it("returns kind=current when appPkg is not a monorepo", () => {
    expect(resolveWorkspaceChoice(stubPkg(false), pnpm)).toEqual({ kind: "current" });
  });

  it("returns root choice with flag=true for pnpm at a monorepo root", () => {
    expect(resolveWorkspaceChoice(stubPkg(true), pnpm)).toEqual({ kind: "root", flag: true });
  });

  it("returns root choice with flag=true for yarn-classic at a monorepo root", () => {
    expect(resolveWorkspaceChoice(stubPkg(true), yarn1)).toEqual({ kind: "root", flag: true });
  });

  it("returns root choice with flag=undefined for npm (no root install protection)", () => {
    expect(resolveWorkspaceChoice(stubPkg(true), npm)).toEqual({ kind: "root", flag: undefined });
  });

  it("returns root choice with flag=undefined for yarn-berry", () => {
    expect(resolveWorkspaceChoice(stubPkg(true), yarn2)).toEqual({ kind: "root", flag: undefined });
  });

  it("returns root choice with flag=undefined when pm detection fails", () => {
    expect(resolveWorkspaceChoice(stubPkg(true), undefined)).toEqual({ kind: "root", flag: undefined });
  });
});

describe("toNypmWorkspace", () => {
  it("returns undefined for kind=current", () => {
    expect(toNypmWorkspace({ kind: "current" })).toBeUndefined();
  });
  it("returns the root flag for kind=root", () => {
    expect(toNypmWorkspace({ kind: "root", flag: true })).toBe(true);
    expect(toNypmWorkspace({ kind: "root", flag: undefined })).toBeUndefined();
  });
});

describe("describeWorkspaceChoice", () => {
  const cases: Array<[WorkspaceChoice, string]> = [
    [{ kind: "current" }, "the current package"],
    [{ kind: "root", flag: true }, "the workspace root"],
    [{ kind: "root", flag: undefined }, "the workspace root"],
  ];
  for (const [choice, expected] of cases) {
    it(`describes ${JSON.stringify(choice)} as "${expected}"`, () => {
      expect(describeWorkspaceChoice(choice)).toBe(expected);
    });
  }
});
