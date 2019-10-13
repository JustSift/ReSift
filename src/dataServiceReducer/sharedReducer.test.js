import sharedReducer from './sharedReducer';
import defineFetch from '../defineFetch';
import { isSuccessAction } from '../createDataService';
import SUCCESS from '../prefixes/SUCCESS';
import createActionType from '../createActionType';
import clearFetch from '../clearFetch';

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
      request: () => () => {},
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

test('clear fetch', () => {
  // given
  const fetchFactory = defineFetch({
    displayName: 'Get People',
    share: { namespace: 'people' },
    make: personId => ({
      request: () => () => ({ id: personId, foo: 'bar' }),
    }),
  });

  const fetch = fetchFactory('person123');
  const fetchAction = fetch();

  const successAction = {
    type: createActionType(SUCCESS, fetchAction.meta),
    meta: fetchAction.meta,
    payload: { mock: 'data' },
  };

  const state = sharedReducer({}, successAction);
  expect(state).toMatchInlineSnapshot(`
Object {
  "people | key:person123": Object {
    "data": Object {
      "mock": "data",
    },
  },
}
`);

  const clearAction = clearFetch(fetch);

  // when
  const newState = sharedReducer(state, clearAction);

  // then
  expect(newState).toMatchInlineSnapshot(`Object {}`);
});
