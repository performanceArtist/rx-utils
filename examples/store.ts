import { EMPTY, Observable } from 'rxjs';
import { makeMapStore } from '../src';

type Message = { id: number; text: string };
type Data = { type: 'pending' } | { type: 'success'; data: Message };
const store = makeMapStore<number, Observable<Data>>();
const mockApi = () => EMPTY;
const getMessagesByChat = (chatID: number) =>
  store.getOrElse(chatID, () => mockApi()); // creates a new observable or returns an old one
const messages$ = getMessagesByChat(0);
