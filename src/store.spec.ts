import { createBehavior, mapStore } from './store';
import { increment } from 'fp-ts/lib/function';
import { option } from 'fp-ts';

describe('createBehavior', () => {
  it('set', () => {
    const b = createBehavior(0);

    b.set(1);
    expect(b.get()).toBe(1);
  });

  it('get', () => {
    const b = createBehavior(0);

    expect(b.get()).toBe(0);
  });

  it('modify', () => {
    const b = createBehavior(0);

    b.modify(increment);
    expect(b.get()).toBe(1);
  });
});

describe('mapStore', () => {
  it('set', () => {
    const store = mapStore<string, number>();

    store.set('test', 1);
    expect(store.get('test')).toStrictEqual(option.some(1));
  });

  it('get', () => {
    const store = mapStore<string, number>();

    store.set('test', 0);
    expect(store.get('test')).toStrictEqual(option.some(0));
  });

  it('modify', () => {
    const store = mapStore<string, number>();

    expect(store.modify('test', increment)).toStrictEqual(option.none);
    store.set('test', 0);
    const resultMap = new Map<string, number>();
    resultMap.set('test', 1);
    expect(store.modify('test', increment)).toStrictEqual(
      option.some(resultMap),
    );
  });

  it('remove', () => {
    const store = mapStore<string, number>();

    expect(store.remove('test')).toStrictEqual(option.none);
    store.set('test', 0);
    expect(store.remove('test')).toStrictEqual(option.some(new Map()));
  });

  it('getOrElse', () => {
    const store = mapStore<string, number>();

    store.getOrElse('test', () => 1);
    expect(store.get('test')).toStrictEqual(option.some(1));
  });
});
