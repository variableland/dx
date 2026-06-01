import { probeBins } from "./bin-probe.ts";
import type {
  InstallContext,
  InstallResult,
  Plugin,
  PluginCapability,
  PluginContext,
  PluginServices,
  UninstallContext,
  UninstallResult,
} from "./types.ts";

export type PluginDefinition<TServices extends PluginServices> = {
  apiVersion: 1;
  name: string;
  color: (value: string) => string;
  services(ctx: PluginContext): TServices | Promise<TServices>;
  install?(this: void, ctx: InstallContext): Promise<InstallResult>;
  uninstall?(this: void, ctx: UninstallContext): Promise<UninstallResult>;
};

type Options<TKind extends PluginCapability> = { only?: readonly TKind[] };

export function definePlugin<TServices extends PluginServices>(
  definition: PluginDefinition<TServices>,
): (options?: Options<keyof TServices & PluginCapability>) => Plugin {
  return (options) => {
    const only = options?.only;
    const pkgName = `@rrlab/${definition.name}-plugin`;

    return {
      name: definition.name,
      color: definition.color,
      ui: definition.color(definition.name),
      apiVersion: definition.apiVersion,
      install: definition.install,
      uninstall: definition.uninstall,
      async services(ctx: PluginContext): Promise<PluginServices> {
        const services = await definition.services(ctx);
        await probeBins(Object.values(services), definition.name);

        if (!only) {
          return services;
        }

        for (const k of only) {
          if (!(k in services)) {
            throw new Error(`${pkgName}: unknown capability '${k}' in 'only'. Available: ${Object.keys(services).join(", ")}.`);
          }
        }

        return Object.fromEntries(only.map((capability) => [capability, services[capability]]));
      },
    };
  };
}
