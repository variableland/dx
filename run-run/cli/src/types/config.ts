import type { Plugin } from "#src/plugin/types.ts";

export type UserConfig = {
  plugins?: Plugin[];
};

export type ExportedConfig = {
  config: UserConfig;
  meta: {
    isDefault: boolean;
    filepath?: string;
  };
};
