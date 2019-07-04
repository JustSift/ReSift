import NORMAL from '../NORMAL';
import LOADING from '../LOADING';
import isLoading from './isLoading';
import { LoadingState, States } from '../models/LoadingState';

test('identity', () => {
  expect(isLoading(LOADING)).toBe(true);
});

describe('returns true if one loading state is loading', () => {
  test('happy path', () => {
    expect(isLoading(NORMAL, NORMAL | LOADING, NORMAL)).toBe(true);
  });

  test('negative path', () => {
    expect(isLoading(NORMAL, NORMAL, NORMAL)).toBe(false);
  });
});

describe('supports the legacy loading state', () => {
  test('happy path', () => {
    expect(isLoading(new LoadingState(States.LOADING))).toBe(true);
  });

  test('happy path', () => {
    expect(isLoading(new LoadingState(States.NORMAL))).toBe(false);
  });
});
