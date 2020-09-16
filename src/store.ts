import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { option, array, either } from 'fp-ts';
import { Option } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { flow, constVoid } from 'fp-ts/lib/function';

export type Handlers<T, K, V> = {
  empty: T;
  get: (key: K, store: T) => Option<V>;
  set: (key: K, value: V, store: T) => Option<T>;
  remove: (key: K, store: T) => Option<T>;
};

export type Store<K, V, T> = {
  get: (key: K) => Option<V>;
  getAll: () => T;
  getOrElse: (key: K, provide: () => V) => V;
  set: (key: K, value: V) => void;
  setAll: (values: T) => void;
  remove: (key: K) => Option<T>;
  has: (key: K) => boolean;
  modify: (key: K, update: (value: V) => V) => void;
  modifyAll: (update: (value: T) => T) => void;
  all$: Observable<T>;
};

export const makeStore = <T, K, V>(
  handlers: Handlers<T, K, V>,
): Store<K, V, T> => {
  const store = new BehaviorSubject(handlers.empty);

  const all$ = store.asObservable();
  const getAll = store.getValue.bind(store);
  const setAll = store.next.bind(store);

  const get = (key: K) => handlers.get(key, store.getValue());

  const set = (key: K, value: V) =>
    pipe(handlers.set(key, value, store.getValue()), option.map(setAll));

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
    pipe(get(key), option.map(flow(update, value => set(key, value))));

  const modifyAll = (update: (value: T) => T) => setAll(update(getAll()));

  const has = (key: K) => pipe(get(key), option.isSome);

  const remove = (key: K) => handlers.remove(key, getAll());

  return {
    get,
    getAll,
    getOrElse,
    set,
    setAll,
    remove,
    has,
    modify,
    modifyAll,
    all$,
  };
};

export const arrayStore = <T>() =>
  makeStore<T[], number, T>({
    empty: array.empty,
    get: array.lookup,
    set: (key, value, store) => pipe(store, array.updateAt(key, value)),
    remove: (key, store) => pipe(store, array.deleteAt(key)),
  });

export const mapStore = <K, V>() =>
  makeStore<Map<K, V>, K, V>({
    empty: new Map(),
    get: (key, store) => option.fromNullable(store.get(key)),
    set: (key, value, store) => option.some(store.set(key, value)),
    remove: (key, store) =>
      store.delete(key) ? option.some(store) : option.none,
  });

export const withWebStorage = (storage: Storage) => <K, V, T>(
  store: Store<K, V, T>,
) => (branch: string) => {
  pipe(
    storage.getItem(branch),
    option.fromNullable,
    option.chain(raw =>
      pipe(either.parseJSON(raw, constVoid), option.fromEither),
    ),
    option.map(initial => store.setAll((initial as any) as T)),
  );

  const updateEffect = pipe(
    store.all$,
    map(values => storage.setItem(branch, JSON.stringify(values))),
  );
  updateEffect.subscribe();

  return store;
};
