import type { Plugin } from "#src/lib/plugin/types.ts";

export type UserConfig = {
  plugins?: Plugin[];
};

export type ExportedConfig = {
  config: UserConfig;
  meta: {
    isDefault: boolean;
    loadMs: number;
    filepath?: string;
  };
};
