import UNKNOWN from '../UNKNOWN';
import LOADING from '../LOADING';
import isUnknown from './isUnknown';

test('identity', () => {
  expect(isUnknown(UNKNOWN)).toBe(true);
});

describe('only returns true if all loading states are normal', () => {
  test('happy path', () => {
    expect(isUnknown(UNKNOWN, UNKNOWN, UNKNOWN)).toBe(true);
  });

  test('negative path', () => {
    expect(isUnknown(UNKNOWN, UNKNOWN, LOADING | UNKNOWN)).toBe(false);
  });
});
