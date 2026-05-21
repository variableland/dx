import {
  definePlugin,
  type FormatOptions,
  type Formatter,
  type InstallContext,
  type InstallResult,
  type Linter,
  type LintOptions,
  ToolService,
  type TypeChecker,
  type TypeCheckOptions,
  type UninstallContext,
  type UninstallResult,
} from "@rrlab/cli/plugin";
import { colorize, type ShellService } from "@vlandoss/clibuddy";
import { TOOL_VERSIONS } from "./tool-versions.ts";

export { TOOL_VERSIONS } from "./tool-versions.ts";

const FROM = import.meta.url;
const oxColor = colorize("#32F3E9");
const UI_LINT = oxColor("oxlint");
const UI_FMT = oxColor("oxfmt");

export class OxlintService extends ToolService implements Linter {
  constructor(shellService: ShellService) {
    super({ pkg: "oxlint", ui: UI_LINT, shellService, from: FROM });
  }

  async lint(options: LintOptions) {
    await this.exec(["--report-unused-disable-directives", options.fix ? "--fix" : "--check"]);
  }
}

export class OxfmtService extends ToolService implements Formatter {
  constructor(shellService: ShellService) {
    super({ pkg: "oxfmt", ui: UI_FMT, shellService, from: FROM });
  }

  async format(options: FormatOptions) {
    await this.exec(["--no-error-on-unmatched-pattern", options.fix ? "--fix" : "--check"]);
  }
}

export class OxlintTypeCheckService extends ToolService implements TypeChecker {
  constructor(shellService: ShellService) {
    super({ pkg: "oxlint", ui: UI_LINT, shellService, from: FROM });
  }

  async check(options: TypeCheckOptions = {}): Promise<void> {
    await this.exec(["--type-aware", "--type-check"], { cwd: options.cwd, verbose: !options.cwd });
  }
}

export async function install(_ctx: InstallContext): Promise<InstallResult> {
  return {
    devDependencies: {
      oxlint: TOOL_VERSIONS.oxlint.install,
      oxfmt: TOOL_VERSIONS.oxfmt.install,
      "oxlint-tsgolint": TOOL_VERSIONS["oxlint-tsgolint"].install,
    },
  };
}

export async function uninstall(_ctx: UninstallContext): Promise<UninstallResult> {
  return { removeDependencies: ["oxlint", "oxfmt", "oxlint-tsgolint"] };
}

const oxc = definePlugin(() => ({
  name: "oxc",
  apiVersion: 1,
  install,
  uninstall,
  capabilities: ({ shell }) => ({
    lint: new OxlintService(shell),
    format: new OxfmtService(shell),
    tsc: new OxlintTypeCheckService(shell),
  }),
}));

export default oxc;
