# Utils and wrappers for rxjs

## Behavior

Wrapper over `BehaviorSubject` with a monad instance:

```ts
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
```

## Store

Reactive key-value cache. The main use case is storage of http request results in observables by keys, but it could be used for any other caching with different data structures.

Basic use case with Map as an underlying data structure:

```ts
type Message = { id: number; text: string };
type Data = { type: 'pending' } | { type: 'success'; data: Message };
const store = makeMapStore<number, Observable<Data>>();
const mockApi = () => EMPTY;
const getMessagesByChat = (chatID: number) =>
  store.getOrElse(chatID, () => mockApi()); // creates a new observable or returns an old one
const messages$ = getMessagesByChat(0);
```
