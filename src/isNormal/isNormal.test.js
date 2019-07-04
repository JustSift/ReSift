import NORMAL from '../NORMAL';
import LOADING from '../LOADING';
import isNormal from './isNormal';
import { LoadingState, States } from '../models/LoadingState';

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

describe('supports the legacy loading state', () => {
  test('happy path', () => {
    expect(isNormal(new LoadingState(States.NORMAL))).toBe(true);
  });

  test('happy path', () => {
    expect(isNormal(new LoadingState(States.LOADING))).toBe(false);
  });
});
