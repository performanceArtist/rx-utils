import { map } from 'rxjs/operators';
import { either } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { flow } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter';
import { Store } from './store';

export const makeWebStorage = <K, V>(storage: Storage, store: Store<K, V>) => (
  key: t.Type<K>,
  value: t.Type<V>,
) => (branch: string) => {
  const codec = t.array(t.tuple([key, value]));

  const initial = pipe(
    storage.getItem(branch),
    either.fromNullable(new Error('No branch found')),
    either.chain(raw =>
      pipe(
        either.parseJSON(raw, () => new Error('Invalid JSON')),
        either.chain(
          flow(
            codec.decode,
            either.mapLeft(errors => new Error(failure(errors).join('\n'))),
          ),
        ),
      ),
    ),
  );

  pipe(
    initial,
    either.bimap(
      error => {
        if (error.message !== 'No branch found') {
          console.error(error);
        }
      },
      initial => store.setAll(initial),
    ),
  );

  const updateEffect = pipe(
    store.all$,
    map(values => storage.setItem(branch, JSON.stringify(values))),
  );
  updateEffect.subscribe();

  return store;
};
