import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { option, tuple, array } from 'fp-ts';
import { Option } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { flow, constVoid } from 'fp-ts/lib/function';
import { behavior } from '../behavior';

export type Entry<K, V> = [K, V];

export type Handlers<T, K, V> = {
  empty: T;
  get: (key: K, store: T) => Option<V>;
  set: (key: K, value: V, store: T) => T;
  remove: (key: K, store: T) => Option<T>;
  entries: (store: T) => Entry<K, V>[];
  fromEntries: (entries: Entry<K, V>[]) => T;
};

export type Store<K, V> = {
  get: (key: K) => Option<V>;
  getAll: () => Entry<K, V>[];
  getOrElse: (key: K, provide: () => V) => V;
  set: (key: K, value: V) => void;
  setAll: (entries: Entry<K, V>[]) => void;
  remove: (key: K) => void;
  modify: (key: K, update: (value: V) => V) => void;
  has: (key: K) => boolean;
  all$: Observable<Entry<K, V>[]>;
  keys$: Observable<K[]>;
  values$: Observable<V[]>;
};

export const makeStore = <T, K, V>(
  handlers: Handlers<T, K, V>,
): Store<K, V> => {
  const store = behavior.create(handlers.empty);

  const get = (key: K) => handlers.get(key, store.get());

  const getAll = flow(store.get, handlers.entries);

  const set = (key: K, value: V) =>
    pipe(handlers.set(key, value, store.get()), store.set);

  const setAll = (entries: Entry<K, V>[]) =>
    store.set(handlers.fromEntries(entries));

  const getOrElse = (key: K, provide: () => V): V =>
    pipe(
      get(key),
      option.getOrElse(() => {
        const value = provide();
        set(key, value);
        return value;
      }),
    );

  const modify = (key: K, update: (value: V) => V) =>
    pipe(
      get(key),
      option.map(flow(update, value => set(key, value))),
      option.getOrElse(constVoid),
    );

  const remove = (key: K) =>
    pipe(
      handlers.remove(key, store.get()),
      option.map(store.set),
      option.getOrElse(constVoid),
    );

  const has = flow(get, option.isSome);

  const all$ = pipe(store.value$, map(handlers.entries));
  const keys$ = pipe(all$, map(array.map(tuple.fst)));
  const values$ = pipe(all$, map(array.map(tuple.snd)));

  return {
    get,
    getAll,
    getOrElse,
    set,
    setAll,
    remove,
    has,
    modify,
    all$,
    keys$,
    values$,
  };
};
