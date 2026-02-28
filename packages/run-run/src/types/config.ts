export type UserConfig = {
  future?: {
    oxc?: boolean;
  };
};

export type ExportedConfig = {
  config: UserConfig;
  meta: {
    isDefault: boolean;
    filepath?: string;
  };
};
