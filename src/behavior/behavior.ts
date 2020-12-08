import { sequenceS, sequenceT } from 'fp-ts/lib/Apply';
import { Monad1 } from 'fp-ts/lib/Monad';
import { pipe, pipeable } from 'fp-ts/lib/pipeable';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export type Behavior<T> = {
  get: () => T;
  set: (value: T) => void;
  modify: (update: (value: T) => T) => void;
  value$: Observable<T>;
};

const fromSubject = <T>(subject: BehaviorSubject<T>): Behavior<T> => {
  const value$ = subject.asObservable();
  const get = subject.getValue.bind(subject);
  const set = subject.next.bind(subject);
  const modify = (update: (value: T) => T) => set(update(get()));

  return {
    get,
    set,
    modify,
    value$,
  };
};

const fromObservable = <A>(o: Observable<A>, initial: A): Behavior<A> => {
  const subject = new BehaviorSubject(initial);
  o.subscribe(subject);
  return fromSubject(subject);
};

export const URI = 'Behavior';
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Behavior: Behavior<A>;
  }
}

export const instanceBehavior: Monad1<'Behavior'> = {
  URI,
  of: <A>(initial: A) => {
    const subject = new BehaviorSubject<A>(initial);
    return fromSubject(subject);
  },
  map: (fa, f) => fromObservable(pipe(fa.value$, map(f)), f(fa.get())),
  ap: (fab, fa) => {
    const initial = fab.get()(fa.get());
    const value$ = pipe(
      combineLatest([fab.value$, fa.value$]),
      map(([fab, fa]) => fab(fa)),
    );

    return fromObservable(value$, initial);
  },
  chain: (fa, f) => {
    const initialB = f(fa.get());
    const value$ = pipe(
      fa.value$,
      switchMap(value => f(value).value$),
    );

    return fromObservable(value$, initialB.get());
  },
};

export const behavior = {
  fromObservable,
  fromSubject,
  sequenceT: sequenceT(instanceBehavior),
  sequenceS: sequenceS(instanceBehavior),
  ...instanceBehavior,
  ...pipeable(instanceBehavior),
};
