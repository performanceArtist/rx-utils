import { makeMapStore } from './map-store';
import { increment } from 'fp-ts/lib/function';
import { option } from 'fp-ts';

describe('mapStore', () => {
  it('set', () => {
    const store = makeMapStore<string, number>();

    store.set('test', 1);
    expect(store.get('test')).toStrictEqual(option.some(1));
  });

  it('get', () => {
    const store = makeMapStore<string, number>();

    store.set('test', 0);
    expect(store.get('test')).toStrictEqual(option.some(0));
  });

  it('modify', () => {
    const store = makeMapStore<string, number>();

    store.set('test', 0);
    store.modify('test', increment);
    expect(store.get('test')).toStrictEqual(option.some(1));
  });

  it('remove', () => {
    const store = makeMapStore<string, number>();

    store.set('test', 0);
    store.remove('test');
    expect(store.getAll()).toStrictEqual([]);
  });

  it('getOrElse', () => {
    const store = makeMapStore<string, number>();

    store.getOrElse('test', () => 1);
    expect(store.get('test')).toStrictEqual(option.some(1));
  });
});
