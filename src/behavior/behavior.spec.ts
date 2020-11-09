import { behavior } from './behavior';
import { increment } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/lib/pipeable';

describe('behavior', () => {
  it('set', () => {
    const b = behavior.of(0);

    b.set(1);
    expect(b.get()).toBe(1);
  });

  it('get', () => {
    const b = behavior.of(0);

    expect(b.get()).toBe(0);
  });

  it('modify', () => {
    const b = behavior.of(0);

    b.modify(increment);
    expect(b.get()).toBe(1);
  });

  it('map', () => {
    const a = behavior.of(0);
    const b = pipe(
      a,
      behavior.map(a => a + 1),
    );

    a.set(1);
    expect(b.get()).toBe(2);

    b.set(3);
    expect(b.get()).toBe(3);
    expect(a.get()).toBe(1);
  });

  it('ap', () => {
    const fab = behavior.of((a: number) => a + 1);
    const fa = behavior.of(0);
    const fb = pipe(fab, behavior.ap(fa));

    fa.set(0);
    expect(fb.get()).toBe(1);

    fab.set(() => 0);
    expect(fb.get()).toBe(0);
  });

  it('chain', () => {
    const fa = behavior.of(0);
    const f = (a: number) => behavior.of(a + 1);
    const fb = pipe(fa, behavior.chain(f));

    expect(fb.get()).toBe(1);

    fa.set(1);
    expect(fb.get()).toBe(2);
  });
});
