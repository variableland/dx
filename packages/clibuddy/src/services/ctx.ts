import { AsyncLocalStorage } from "node:async_hooks";

export class ContextService<T> {
  #asyncLocalStorage: AsyncLocalStorage<T>;

  constructor(storage: AsyncLocalStorage<T>) {
    this.#asyncLocalStorage = storage;
  }

  runContext<R>(store: T, callback: () => Promise<R>) {
    return this.#asyncLocalStorage.run(store, callback);
  }

  get value() {
    const store = this.#asyncLocalStorage.getStore();

    if (!store) {
      throw new Error("Store not found, please call runContext() first");
    }

    return store;
  }
}

export function createContextService<T>(
  storage: AsyncLocalStorage<T> = new AsyncLocalStorage<T>(),
): ContextService<T> {
  return new ContextService<T>(storage);
}
