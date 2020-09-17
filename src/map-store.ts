import { makeStore, Store } from './store';
import { option } from 'fp-ts';

export type MapStore<K, V> = Store<K, V>;

export const makeMapStore = <K, V>() =>
  makeStore<Map<K, V>, K, V>({
    empty: new Map(),
    get: (key, store) => option.fromNullable(store.get(key)),
    set: (key, value, store) => store.set(key, value),
    remove: (key, store) =>
      store.delete(key) ? option.some(store) : option.none,
    entries: store => Array.from(store.entries()),
    fromEntries: entries => new Map(entries),
  });
