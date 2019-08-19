import dataServiceReducer from '../dataServiceReducer';
import defineFetch from '../defineFetch';
import createActionType from '../createActionType';
import ERROR from '../prefixes/ERROR';
import SUCCESS from '../prefixes/SUCCESS';
import { isErrorAction, isSuccessAction } from '../createDataService';
import isError from '../isError';
import isLoading from '../isLoading';
import isNormal from '../isNormal';
import isUnknown from '../isUnknown';

import getFetch, { getStatus, arrayShallowEqual } from './getFetch';

jest.mock('shortid', () => () => 'test-short-id');
jest.mock('../timestamp', () => () => 'test-timestamp');

describe('arrayShallowEqual', () => {
  test('returns false when the lengths are not the same', () => {
    expect(arrayShallowEqual([], [1])).toBe(false);
  });
});

describe('getStatus', () => {
  test('unknown', () => {
    // given
    const mockActionState = undefined;

    // when
    const status = getStatus(mockActionState);

    // then
    expect(isUnknown(status)).toBe(true);
    expect(isLoading(status)).toBe(false);
    expect(isNormal(status)).toBe(false);
    expect(isError(status)).toBe(false);
  });
  test('loading', () => {
    // given
    const mockActionState = {
      payload: undefined,
      inflight: () => {},
    };

    // when
    const status = getStatus(mockActionState);

    // then
    expect(isUnknown(status)).toBe(false);
    expect(isLoading(status)).toBe(true);
    expect(isNormal(status)).toBe(false);
    expect(isError(status)).toBe(false);
  });
  test('normal', () => {
    // given
    const mockActionState = {
      payload: 'something',
      hadSuccess: true,
    };

    // when
    const status = getStatus(mockActionState);

    // then
    expect(isUnknown(status)).toBe(false);
    expect(isLoading(status)).toBe(false);
    expect(isNormal(status)).toBe(true);
    expect(isError(status)).toBe(false);
  });
  test('error', () => {
    // given
    const mockActionState = {
      payload: new Error('test error'),
      error: true,
    };

    // when
    const status = getStatus(mockActionState);

    // then
    expect(isUnknown(status)).toBe(false);
    expect(isLoading(status)).toBe(false);
    expect(isNormal(status)).toBe(false);
    expect(isError(status)).toBe(true);
  });
  test('combined', () => {
    // given
    const mockActionState = {
      payload: 'test',

      error: true,
    };

    // when
    const status = getStatus(mockActionState);

    // then
    expect(isUnknown(status)).toBe(false);
    expect(isLoading(status)).toBe(false);
    expect(isNormal(status)).toBe(false);
    expect(isError(status)).toBe(true);
  });
});

describe('getFetch', () => {
  test('throws if there is no fetch action', () => {
    expect(() => {
      getFetch();
    }).toThrowErrorMatchingInlineSnapshot(`"first argument, the fetch action, is required"`);
  });

  test('throws if there is no state', () => {
    expect(() => {
      const actionCreator = defineFetch({
        displayName: 'test',
        key: 'test',
        // eslint-disable-next-line
        action: () => ({}) => {},
      });

      const noState = undefined;

      getFetch(actionCreator(), noState);
    }).toThrowErrorMatchingInlineSnapshot(`"\`make\` is required in \`defineFetch\`"`);
  });

  test('throws if there is no data service key', () => {
    expect(() => {
      const actionCreator = defineFetch({
        displayName: 'test',
        key: 'test',
        // eslint-disable-next-line
        action: () => ({}) => {},
      });

      const noState = {};

      getFetch(actionCreator(), noState);
    }).toThrowErrorMatchingInlineSnapshot(`"\`make\` is required in \`defineFetch\`"`);
  });

  test("returns null and UNKNOWN if the values isn't in the store", () => {
    // given
    const state = { dataService: dataServiceReducer({}, {}) };
    expect(state).toMatchInlineSnapshot(`
Object {
  "dataService": Object {
    "actions": Object {},
    "shared": Object {},
  },
}
`);

    const actionCreatorFactory = defineFetch({
      displayName: 'example fetch',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });

    // when
    const [data, status] = getFetch(actionCreatorFactory('test arg')(), state);

    // then
    expect(data).toBe(null);
    expect(isUnknown(status)).toBe(true);
  });

  test.skip('unshared: returns null with an error status if there was an error', () => {
    // given
    const actionCreatorFactory = defineFetch({
      displayName: 'example fetch',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });

    const fetchAction = actionCreatorFactory('test arg')();

    const errorAction = {
      type: createActionType(ERROR, fetchAction.meta),
      meta: fetchAction.meta,
      payload: new Error('test error'),
      error: true,
    };

    expect(isErrorAction(errorAction)).toBe(true);

    const state = { dataService: dataServiceReducer({}, errorAction) };
    expect(state).toMatchInlineSnapshot(`
Object {
  "dataService": Object {
    "actions": Object {
      "example fetch | test-short-id": Object {
        "key:test arg": Object {
          "error": true,
          "inflight": undefined,
          "meta": Object {
            "fetchFactoryId": "test-short-id",
            "conflict": "cancel",
            "displayName": "example fetch",
            "key": "key:test arg",
            "share": undefined,
          },
          "payload": [Error: test error],
          "shared": false,
          "updatedAt": "test-timestamp",
        },
      },
    },
    "shared": Object {},
  },
}
`);

    // when
    const [data, status] = getFetch(actionCreatorFactory('test arg'), state);

    // then
    expect(data).toBe(null);
    expect(isError(status)).toBe(true);
  });

  test('unshared', () => {
    // given
    const actionCreatorFactory = defineFetch({
      displayName: 'example fetch',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });

    const fetchAction = actionCreatorFactory('test arg')();

    const successAction = {
      type: createActionType(SUCCESS, fetchAction.meta),
      meta: fetchAction.meta,
      payload: { mock: 'data' },
    };

    expect(isSuccessAction(successAction)).toBe(true);

    const state = { dataService: dataServiceReducer({}, successAction) };
    expect(state).toMatchInlineSnapshot(`
Object {
  "dataService": Object {
    "actions": Object {
      "example fetch | test-short-id": Object {
        "key:test arg": Object {
          "error": false,
          "hadSuccess": true,
          "inflight": undefined,
          "meta": Object {
            "conflict": "cancel",
            "displayName": "example fetch",
            "fetchFactoryId": "test-short-id",
            "key": "key:test arg",
            "share": undefined,
          },
          "payload": Object {
            "mock": "data",
          },
          "shared": false,
          "updatedAt": "test-timestamp",
        },
      },
    },
    "shared": Object {},
  },
}
`);

    // when
    const [data, status] = getFetch(actionCreatorFactory('test arg'), state);

    // then
    expect(data).toMatchInlineSnapshot(`
Object {
  "mock": "data",
}
`);
    expect(isNormal(status)).toBe(true);
    expect(isLoading(status)).toBe(false);
  });

  test.todo('static key');
});
