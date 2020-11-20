import { EMPTY, Observable } from 'rxjs';
import { makeMapStore, makeWebStorage } from './store';
import * as t from 'io-ts';

type Message = { id: number; text: string };
type Data = { type: 'pending' } | { type: 'success'; data: Message };
const store = makeMapStore<number, Observable<Data>>();
const mockApi = () => EMPTY;
const getMessagesByChat = (chatID: number) =>
  store.getOrElse(chatID, () => mockApi()); // creates a new observable or returns an old one
const messages$ = getMessagesByChat(0);

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
