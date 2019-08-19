import UNKNOWN from '../UNKNOWN';
import NORMAL from '../NORMAL';
import ERROR from '../ERROR';
import LOADING from '../LOADING';

import isUnknown from '../isUnknown';
import isNormal from '../isNormal';
import isLoading from '../isLoading';
import isError from '../isError';

import combineStatuses from './combineStatuses';

describe('unknown', () => {
  test('all must be unknown', () => {
    const combined = combineStatuses(UNKNOWN, UNKNOWN);
    expect(isUnknown(combined)).toBe(true);
  });
  test('otherwise, it is not unknown', () => {
    const combined = combineStatuses(UNKNOWN, LOADING, ERROR | NORMAL);
    expect(isUnknown(combined)).toBe(false);
  });
});

describe('normal', () => {
  test('all must include normal', () => {
    const combined = combineStatuses(NORMAL, NORMAL | ERROR, NORMAL | LOADING);
    expect(isNormal(combined)).toBe(true);
  });
  test('otherwise, it is not normal', () => {
    const combined = combineStatuses(LOADING, NORMAL | LOADING, NORMAL | ERROR);
    expect(isNormal(combined)).toBe(false);
  });
});

describe('error', () => {
  test('at least one must be error', () => {
    const combined = combineStatuses(NORMAL, NORMAL | ERROR, LOADING, LOADING);
    expect(isError(combined)).toBe(true);
  });
  test("isn't an error if none are error", () => {
    const combined = combineStatuses(NORMAL | LOADING, LOADING, UNKNOWN);
    expect(isError(combined)).toBe(false);
  });
});

describe('loading', () => {
  test('at least one must be loading', () => {
    const combined = combineStatuses(NORMAL, NORMAL, ERROR, NORMAL | LOADING);
    expect(isLoading(combined)).toBe(true);
  });
  test("isn't a 'loading' if none are loading", () => {
    const combined = combineStatuses(NORMAL | ERROR, UNKNOWN, ERROR);
    expect(isLoading(combined)).toBe(false);
  });
});
