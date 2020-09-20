import { behavior } from './behavior';
import { increment } from 'fp-ts/lib/function';

describe('behavior.create', () => {
  it('set', () => {
    const b = behavior.create(0);

    b.set(1);
    expect(b.get()).toBe(1);
  });

  it('get', () => {
    const b = behavior.create(0);

    expect(b.get()).toBe(0);
  });

  it('modify', () => {
    const b = behavior.create(0);

    b.modify(increment);
    expect(b.get()).toBe(1);
  });
});
