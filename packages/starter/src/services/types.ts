export type GenerateOptions = {
  generatorId: string;
  bypassArr?: string[];
};

export type TemplateService = {
  generate: (options: GenerateOptions) => Promise<void>;
};
