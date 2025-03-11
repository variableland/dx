import { AsyncLocalStorage } from "node:async_hooks";
import type { Store } from "./store";

const asyncLocalStorage = new AsyncLocalStorage<Store>();

export function runContext(store: Store, callback: () => Promise<void>) {
  asyncLocalStorage.run(store, callback);
}

export function useStore() {
  const store = asyncLocalStorage.getStore();

  if (!store) {
    throw new Error("Store not found, please call createStore() first");
  }

  return store;
}
