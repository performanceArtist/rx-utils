import { BehaviorSubject } from 'rxjs';

const create = <T>(initial: T) => {
  const subject = new BehaviorSubject<T>(initial);
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

export const behavior = {
  create,
};
