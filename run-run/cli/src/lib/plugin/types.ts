import type { Pkg, ShellService } from "@vlandoss/clibuddy";
import type { AnyLogger as Logger } from "@vlandoss/loggy";
import type { ReleaseService } from "#src/services/release.ts";
import type { Doctor, Formatter, Linter, Packer, StaticChecker, TestRunner, TypeChecker } from "#src/types/tool.ts";

export type * from "#src/types/tool.ts";

export type PluginCapability = keyof PluginServices;

export type PluginServices = {
  lint?: Linter & Doctor;
  format?: Formatter & Doctor;
  jscheck?: StaticChecker & Doctor;
  typecheck?: TypeChecker & Doctor;
  pack?: Packer & Doctor;
  test?: TestRunner & Doctor;
};

export type PluginContext = {
  shell: ShellService;
  logger: Logger;
  appPkg: Pkg;
  binPkg: Pkg;
  cwd: string;
};

export type Plugin = {
  apiVersion: 1;
  name: string;
  readonly ui: string;
  color(label: string): string;
  services(ctx: PluginContext): Promise<PluginServices>;
  install?(ctx: InstallContext): Promise<InstallResult>;
  uninstall?(ctx: UninstallContext): Promise<UninstallResult>;
};

export type ClackPromptsSelectOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

export type ClackPrompts = {
  select<T extends string>(opts: {
    message: string;
    options: Array<ClackPromptsSelectOption<T>>;
    initialValue?: T;
  }): Promise<T | symbol>;
  confirm(opts: { message: string; initialValue?: boolean }): Promise<boolean | symbol>;
  isCancel(value: unknown): value is symbol;
};

export type InstallFlags = {
  force: boolean;
  yes: boolean;
  nonInteractive: boolean;
};

export type UninstallFlags = {
  yes: boolean;
  nonInteractive: boolean;
};

export type InstallContext = {
  shell: ShellService;
  logger: Logger;
  appPkg: Pkg;
  prompts: ClackPrompts;
  flags: InstallFlags;
  release: ReleaseService;
};

export type UninstallContext = {
  shell: ShellService;
  logger: Logger;
  appPkg: Pkg;
  prompts: ClackPrompts;
  flags: UninstallFlags;
};

/**
 * Declarative edits on a JSON file. Paths follow JSON Pointer (RFC 6901):
 * `"/extends"`, `"/compilerOptions/strict"`, `"/extends/0"`.
 *
 * NOT strict RFC 6902 JSON Patch — those ops fail on path-condition
 * mismatches (`add` fails if key exists; `replace` fails if missing), which
 * doesn't work for our idempotent merge semantics. See D-005.
 */
export type JsonEdit =
  | {
      op: "set";
      path: string;
      value: unknown;
      /** "replace" = always set; "if-missing" = only insert when the path doesn't resolve. */
      mode?: "replace" | "if-missing";
    }
  | { op: "unset"; path: string }
  | {
      op: "include";
      path: string;
      value: unknown;
      /** Where to insert into the target array if the value isn't already present. */
      position?: "start" | "end";
    }
  | { op: "exclude"; path: string; value: unknown };

export type FileOp =
  | { kind: "create"; path: string; content: string; overwrite?: boolean }
  | { kind: "edit-json"; path: string; edits: JsonEdit[] }
  /** Escape hatch for non-JSON / TS-module edits. The plugin owns the parse. */
  | { kind: "edit-text"; path: string; edit: (source: string) => string }
  | { kind: "delete"; path: string };

export type InstallResult = {
  /** Packages to install in the host's package.json as devDependencies. */
  devDependencies?: Record<string, string>;
  files?: FileOp[];
};

export type UninstallResult = {
  /** Packages to remove from the host's package.json. */
  removeDependencies?: string[];
  files?: FileOp[];
};
