import NORMAL from '../NORMAL';
import LOADING from '../LOADING';
import isNormal from './isNormal';

test('identity', () => {
  expect(isNormal(NORMAL)).toBe(true);
});

describe('only returns true if all loading states are normal', () => {
  test('happy path', () => {
    expect(isNormal(NORMAL, NORMAL | LOADING, NORMAL)).toBe(true);
  });

  test('negative path', () => {
    expect(isNormal(NORMAL, LOADING, NORMAL)).toBe(false);
  });
});
