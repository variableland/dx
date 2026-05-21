import {
  definePlugin,
  type FormatOptions,
  type Formatter,
  type InstallContext,
  type InstallResult,
  type Linter,
  type LintOptions,
  ToolService,
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

const oxc = definePlugin<void>(() => ({
  name: "oxc",
  apiVersion: 1,
  install,
  uninstall,
  async setup({ shell }) {
    const lintSvc = new OxlintService(shell);
    const fmtSvc = new OxfmtService(shell);
    try {
      await Promise.all([lintSvc.getBinDir(), fmtSvc.getBinDir()]);
    } catch (_err) {
      throw new Error(
        "@rrlab/oxc-plugin requires oxlint and oxfmt to be installed in the host project. " +
          "Run: rr plugins add oxc  (or: pnpm add -D oxlint oxfmt)",
      );
    }
    return {
      lint: lintSvc,
      format: fmtSvc,
    };
  },
}));

export default oxc;
