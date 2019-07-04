import ERROR from '../ERROR';
import LOADING from '../LOADING';
import isError from './isError';
import { LoadingState, States } from '../models/LoadingState';

test('identity', () => {
  expect(isError(ERROR)).toBe(true);
});

describe('returns true if one loading state is loading', () => {
  test('happy path', () => {
    expect(isError(ERROR, LOADING | LOADING, LOADING)).toBe(true);
  });

  test('negative path', () => {
    expect(isError(LOADING, LOADING, LOADING)).toBe(false);
  });
});

describe('supports the legacy loading state', () => {
  test('happy path', () => {
    expect(isError(new LoadingState(States.ERROR))).toBe(true);
  });

  test('happy path', () => {
    expect(isError(new LoadingState(States.NORMAL))).toBe(false);
  });
});
