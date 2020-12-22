import { pipe } from 'fp-ts/lib/pipeable';
import { of } from 'rxjs';
import { behavior } from '../src';

const counter = behavior.of(0);
const value = counter.get();
const value$ = counter.value$;
counter.set(1);
counter.modify(counter => counter + 1);

const message = pipe(
  counter,
  behavior.map(value => `Value: ${value}`),
);

const anotherMessage = pipe(
  counter,
  behavior.map(value => `Value: ${value + 1}`),
);
const messages = pipe(
  behavior.sequenceT(message, anotherMessage),
  behavior.map(
    ([message1, message2]) => `Message1: ${message1}, Message2: ${message2}`,
  ),
);

type Request = { type: 'success'; value: string } | { type: 'pending' };
const request = (id: number) =>
  behavior.fromObservable<Request>(of({ type: 'success', value: 'Result' }), {
    type: 'pending',
  });
const requestByCounter = pipe(counter, behavior.chain(request));
