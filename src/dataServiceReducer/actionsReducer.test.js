import defineFetch from '../defineFetch';
import actionsReducer from './actionsReducer';
import createActionType from '../createActionType';
import SUCCESS from '../prefixes/SUCCESS';
import ERROR from '../prefixes/ERROR';
import { isSuccessAction, isErrorAction } from '../createDataService';
import clearFetch, { isClearAction } from '../clearFetch';

jest.mock('../timestamp', () => () => 'test-timestamp');
jest.mock('shortid', () => () => 'test-shortid');

test("it returns the previous state if the action isn't a fetch, success, or error, action", () => {
  const mockAction = { type: 'not a match' };
  const previousState = {};
  const newState = actionsReducer(previousState, mockAction);

  expect(newState).toBe(previousState);
});

test('when given a fetch action, it adds an inflight payload to the store', () => {
  const makeFetch = defineFetch({
    displayName: 'example fetch',
    make: (testArg) => ({
      request: () => ({ exampleService }) => exampleService(testArg),
    }),
  });

  const fetch = makeFetch('test arg');
  const action = fetch();

  const previousState = {};
  const newState = actionsReducer(previousState, action);

  expect(newState).toMatchInlineSnapshot(`
    Object {
      "example fetch | test-shortid": Object {
        "key:test arg": Object {
          "inflight": [Function],
          "meta": Object {
            "conflict": "cancel",
            "displayName": "example fetch",
            "fetchFactoryId": "test-shortid",
            "key": "key:test arg",
            "share": undefined,
          },
          "shared": false,
          "updatedAt": "test-timestamp",
        },
      },
    }
  `);
});

test('when given a success action, it adds a success payload and replaces the inflight', () => {
  // given
  const makeActionCreator = defineFetch({
    displayName: 'example action',
    make: (testArg) => ({
      request: () => ({ exampleService }) => exampleService(testArg),
    }),
  });

  const actionCreator = makeActionCreator('test arg');
  const fetchAction = actionCreator();

  const successAction = {
    type: createActionType(SUCCESS, fetchAction.meta),
    meta: fetchAction.meta,
    payload: { mock: 'data' },
  };

  expect(isSuccessAction(successAction)).toBe(true);

  // when
  const newState = actionsReducer({}, successAction);

  // then
  expect(newState).toMatchInlineSnapshot(`
    Object {
      "example action | test-shortid": Object {
        "key:test arg": Object {
          "data": Object {
            "mock": "data",
          },
          "error": false,
          "errorData": null,
          "hadSuccess": true,
          "inflight": undefined,
          "meta": Object {
            "conflict": "cancel",
            "displayName": "example action",
            "fetchFactoryId": "test-shortid",
            "key": "key:test arg",
            "share": undefined,
          },
          "shared": false,
          "updatedAt": "test-timestamp",
        },
      },
    }
  `);
});

test('when given a clear action, it removes the sub-store', () => {
  // given
  const makeFetch = defineFetch({
    displayName: 'example action',
    make: (testArg) => ({
      request: () => ({ exampleService }) => exampleService(testArg),
    }),
  });

  const oneFetch = makeFetch('one');
  const twoFetch = makeFetch('two');

  const oneFetchSuccess = {
    type: createActionType(SUCCESS, oneFetch.meta),
    meta: oneFetch.meta,
    payload: { mock: 'one' },
  };

  const twoFetchSuccess = {
    type: createActionType(SUCCESS, twoFetch.meta),
    meta: twoFetch.meta,
    payload: { mock: 'two' },
  };

  const oneState = actionsReducer({}, oneFetchSuccess);
  const state = actionsReducer(oneState, twoFetchSuccess);

  expect(state).toMatchInlineSnapshot(`
    Object {
      "example action | test-shortid": Object {
        "key:one": Object {
          "data": Object {
            "mock": "one",
          },
          "error": false,
          "errorData": null,
          "hadSuccess": true,
          "inflight": undefined,
          "meta": Object {
            "conflict": "cancel",
            "displayName": "example action",
            "fetchFactoryId": "test-shortid",
            "key": "key:one",
            "share": undefined,
            "type": "FETCH_INSTANCE",
          },
          "shared": false,
          "updatedAt": "test-timestamp",
        },
        "key:two": Object {
          "data": Object {
            "mock": "two",
          },
          "error": false,
          "errorData": null,
          "hadSuccess": true,
          "inflight": undefined,
          "meta": Object {
            "conflict": "cancel",
            "displayName": "example action",
            "fetchFactoryId": "test-shortid",
            "key": "key:two",
            "share": undefined,
            "type": "FETCH_INSTANCE",
          },
          "shared": false,
          "updatedAt": "test-timestamp",
        },
      },
    }
  `);

  const clearAction = clearFetch(oneFetch('test arg'));
  expect(isClearAction(clearAction)).toBe(true);

  // when
  const clearState = actionsReducer(state, clearAction);

  // then
  expect(clearState).toMatchInlineSnapshot(`
    Object {
      "example action | test-shortid": Object {
        "key:two": Object {
          "data": Object {
            "mock": "two",
          },
          "error": false,
          "errorData": null,
          "hadSuccess": true,
          "inflight": undefined,
          "meta": Object {
            "conflict": "cancel",
            "displayName": "example action",
            "fetchFactoryId": "test-shortid",
            "key": "key:two",
            "share": undefined,
            "type": "FETCH_INSTANCE",
          },
          "shared": false,
          "updatedAt": "test-timestamp",
        },
      },
    }
  `);
});

test('when given an error action, it adds an error payload and replaces the inflight', () => {
  // given
  const makeActionCreator = defineFetch({
    displayName: 'example action',
    make: (testArg) => ({
      request: () => ({ exampleService }) => exampleService(testArg),
    }),
  });

  const actionCreator = makeActionCreator('test arg');
  const fetchAction = actionCreator();

  const errorAction = {
    type: createActionType(ERROR, fetchAction.meta),
    meta: fetchAction.meta,
    payload: new Error('test error'),
  };

  expect(isErrorAction(errorAction)).toBe(true);

  // when
  const newState = actionsReducer({}, errorAction);

  // then
  expect(newState).toMatchInlineSnapshot(`
    Object {
      "example action | test-shortid": Object {
        "key:test arg": Object {
          "error": true,
          "errorData": [Error: test error],
          "inflight": undefined,
          "meta": Object {
            "conflict": "cancel",
            "displayName": "example action",
            "fetchFactoryId": "test-shortid",
            "key": "key:test arg",
            "share": undefined,
          },
          "shared": false,
          "updatedAt": "test-timestamp",
        },
      },
    }
  `);
});
