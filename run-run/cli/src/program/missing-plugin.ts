const SUGGESTIONS: Record<string, string[]> = {
  lint: ["biome", "oxc", "eslint"],
  format: ["biome", "oxc"],
  jsc: ["biome"],
  tsc: ["ts"],
  pack: ["tsdown"],
};

export function missingPluginError(kind: string): Error {
  const aliases = SUGGESTIONS[kind] ?? [];
  const officialList = aliases.map((a) => `@rrlab/plugin-${a}`).join(", ");
  const addList = aliases.map((a) => `rr plugins add ${a}`).join(" | ");
  return new Error(
    `No plugin provides the '${kind}' capability.` +
      (officialList ? `\n  Install one of: ${officialList}.` : "") +
      (addList ? `\n  Try: ${addList}.` : ""),
  );
}
