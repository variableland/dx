export const TOOL_VERSIONS = {
  // install range > peer range on purpose: pin latest stable for fresh installs,
  // accept TS 5+ if the host already has it.
  typescript: { install: "^6.0.0", peer: ">=5.0.0" },
  "@types/node": { install: ">=20" },
} as const;
