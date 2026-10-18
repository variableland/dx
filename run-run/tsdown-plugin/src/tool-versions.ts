export const TOOL_VERSIONS = {
  // `install` is the prescriptive pin used by `rr plugins add`'s nypm call.
  // The looser contracts live in package.json#peerDependencies. typescript
  // matches the ts and astro plugins' pin, so adding them in either order
  // never leaves conflicting ranges.
  tsdown: { install: "^0.22.0" },
  typescript: { install: "^6.0.0" },
} as const;
