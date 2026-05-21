import { ToolService } from "./tool-service.ts";

export async function probeBins(services: readonly unknown[], pluginName: string): Promise<void> {
  const toolServices = services.filter((s): s is ToolService => s instanceof ToolService);
  const distinct = new Map<string, ToolService>();
  for (const svc of toolServices) {
    if (!distinct.has(svc.pkg)) distinct.set(svc.pkg, svc);
  }

  if (distinct.size === 0) return;

  const probes = [...distinct.values()].map(async (svc) => {
    try {
      await svc.getBinDir();
    } catch {
      return svc.pkg;
    }
    return null;
  });

  const results = await Promise.all(probes);
  const missing = results.filter((p): p is string => p !== null);
  if (missing.length === 0) return;

  const pkgName = `@rrlab/${pluginName}-plugin`;
  throw new Error(
    `${pkgName} requires ${missing.join(", ")} to be installed in the host project. ` +
      `Run: rr plugins add ${pluginName}  (or: pnpm add -D ${missing.join(" ")})`,
  );
}
