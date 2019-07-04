import sharedReducer from './sharedReducer';
import defineFetch from '../defineFetch';
import { isSuccessAction } from '../createDataServiceMiddleware';
import SUCCESS from '../prefixes/SUCCESS';
import createActionType from '../createActionType';

jest.mock('shortid', () => () => 'test-short-id');

test('returns the previous state if the action is not a success action', () => {
  // given
  const otherAction = { type: 'test action' };

  const previousState = {};

  // when
  const newState = sharedReducer(previousState, otherAction);

  // then
  expect(newState).toBe(previousState);
});

test('returns the previous state if the action is not shared', () => {
  // given
  const actionCreatorFactory = defineFetch({
    displayName: 'test action',
    make: testArg => ({
      key: [testArg],
      fetch: () => () => {},
    }),
  });

  const fetchAction = actionCreatorFactory()();
  const successAction = {
    type: createActionType(SUCCESS, fetchAction.meta),
    meta: fetchAction.meta,
    payload: { mock: 'data' },
  };

  expect(isSuccessAction(successAction)).toBe(true);

  const previousState = {};

  // when
  const newState = sharedReducer(previousState, successAction);

  // then
  expect(newState).toBe(previousState);
});
