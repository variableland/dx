export type GenerateOptions = {
  generatorId: string;
  bypassArr?: string[];
};

export type GenerateResult<T> = {
  answers: T;
};

export type TemplateService = {
  generate: <R>(options: GenerateOptions) => Promise<GenerateResult<R>>;
};
