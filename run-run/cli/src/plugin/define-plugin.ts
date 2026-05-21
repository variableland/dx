import { probeBins } from "./bin-probe.ts";
import type {
  InstallContext,
  InstallResult,
  Plugin,
  PluginCapabilities,
  PluginContext,
  PluginKind,
  UninstallContext,
  UninstallResult,
} from "./types.ts";

type Caps = Partial<PluginCapabilities>;

export type PluginDefinition<TCaps extends Caps> = {
  name: string;
  apiVersion: 1;
  capabilities(ctx: PluginContext): TCaps | Promise<TCaps>;
  install?(this: void, ctx: InstallContext): Promise<InstallResult>;
  uninstall?(this: void, ctx: UninstallContext): Promise<UninstallResult>;
};

type WithOnly<TOptions, TKind extends PluginKind> = TOptions extends void
  ? { only?: readonly TKind[] }
  : TOptions & { only?: readonly TKind[] };

export function definePlugin<TCaps extends Caps, TOptions = void>(
  factory: (options: TOptions) => PluginDefinition<TCaps>,
): (options?: WithOnly<TOptions, keyof TCaps & PluginKind>) => Plugin {
  return (options) => {
    // biome-ignore lint/suspicious/noExplicitAny: factory accepts TOptions; callers without options pass undefined
    const def = factory(options as any);
    const only = (options as { only?: readonly string[] } | undefined)?.only;
    const pkgName = `@rrlab/${def.name}-plugin`;

    return {
      name: def.name,
      apiVersion: def.apiVersion,
      install: def.install,
      uninstall: def.uninstall,
      async capabilities(ctx: PluginContext): Promise<PluginCapabilities> {
        const map = (await def.capabilities(ctx)) as PluginCapabilities;
        await probeBins(Object.values(map), def.name);
        if (!only) return map;
        for (const k of only) {
          if (!(k in map)) {
            throw new Error(`${pkgName}: unknown capability '${k}' in 'only'. Available: ${Object.keys(map).join(", ")}.`);
          }
        }
        return Object.fromEntries(only.map((k) => [k, map[k as PluginKind]])) as PluginCapabilities;
      },
    };
  };
}
