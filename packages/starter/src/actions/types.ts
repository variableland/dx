export type AnyAction<T> = {
  execute: (options: T) => Promise<void>;
};
