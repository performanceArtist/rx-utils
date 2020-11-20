# Store

Simple wrapper around BehaviorSubject from rxjs. The main use case is the storage of http request results in observables by keys, but it could be used for any other caching with different data structures. Also contains a Monad instance for Behavior wrapper.

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

The same implementation, but with added Storage read/write effects + validation:

```ts
const withLocalStorage = makeWebStorage(
  localStorage,
  makeMapStore<number, Message[]>(),
);
const withMessageScheme = withLocalStorage(
  t.number,
  t.array(
    t.type({
      id: t.number,
      text: t.string,
    }),
  ),
);
const messageStore = withMessageScheme('messages');
const messages = messageStore.get(0);
```
