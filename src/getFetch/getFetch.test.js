import dataServiceReducer from '../dataServiceReducer';
import defineFetch from '../defineFetch';
import createActionType from '../createActionType';
import RESIFT_ERROR from '../prefixes/ERROR';
import RESIFT_SUCCESS from '../prefixes/SUCCESS';
import UNKNOWN from '../UNKNOWN';
import NORMAL from '../NORMAL';
import LOADING from '../LOADING';
import ERROR from '../ERROR';
import isError from '../isError';
import isLoading from '../isLoading';
import isNormal from '../isNormal';
import isUnknown from '../isUnknown';

import getFetch, { getStatus, combineSharedStatuses } from './getFetch';

jest.mock('shortid', () => () => 'test-short-id');
jest.mock('../timestamp', () => () => 'test-timestamp');

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

describe('combineSharedStatuses', () => {
  describe('if all statuses is unknown then the resulting status is also unknown', () => {
    test('positive', () => {
      const combined = combineSharedStatuses(UNKNOWN, UNKNOWN);
      expect(isUnknown(combined)).toBe(true);
    });
    test('negative', () => {
      const combined = combineSharedStatuses(UNKNOWN, NORMAL);
      expect(isUnknown(combined)).toBe(false);
    });
  });

  describe('if one status is loading, the combined status is also loading', () => {
    test('positive', () => {
      const combined = combineSharedStatuses(NORMAL, LOADING);
      expect(isLoading(combined)).toBe(true);
    });
    test('negative', () => {
      const combined = combineSharedStatuses(NORMAL, ERROR);
      expect(isLoading(combined)).toBe(false);
    });
  });

  describe('if one status is normal, the combined status is also normal', () => {
    //      this is the desired behavior because shared fetches share the same state
    test('positive', () => {
      const combined = combineSharedStatuses(NORMAL, LOADING);
      expect(isNormal(combined)).toBe(true);
    });
    test('negative', () => {
      const combined = combineSharedStatuses(LOADING, ERROR);
      expect(isNormal(combined)).toBe(false);
    });
  });

  describe('if one status is error, the combined status is also error', () => {
    test('positive', () => {
      const combined = combineSharedStatuses(ERROR, LOADING);
      expect(isError(combined)).toBe(true);
    });
    test('negative', () => {
      const combined = combineSharedStatuses(NORMAL, LOADING);
      expect(isError(combined)).toBe(false);
    });
  });
});

describe('getFetch', () => {
  test('throws if there is no fetch action', () => {
    expect(() => {
      getFetch();
    }).toThrowErrorMatchingInlineSnapshot(`"[getFetch] First argument, the fetch, is required"`);
  });

  test('throws if there is no state', () => {
    expect(() => {
      const actionCreator = defineFetch({
        displayName: 'Test',
        make: () => ({
          key: [],
          request: () => () => {},
        }),
      });

      const noState = undefined;

      getFetch(actionCreator(), noState);
    }).toThrowErrorMatchingInlineSnapshot(`"[getFetch] State argument is required"`);
  });

  test('throws if there is no data service key', () => {
    expect(() => {
      const actionCreator = defineFetch({
        displayName: 'Test',
        make: () => ({
          key: [],
          request: () => () => {},
        }),
      });

      const noState = {};

      getFetch(actionCreator(), noState);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[getFetch] \\"dataService\\" is a required key. pass in the whole store state."`,
    );
  });

  test("throws if a fetch instance wasn't passed in", () => {
    const state = { dataService: dataServiceReducer({}, {}) };
    expect(state).toMatchInlineSnapshot(`
      Object {
        "dataService": Object {
          "actions": Object {},
          "shared": Object {},
        },
      }
    `);

    const makeMyFetch = defineFetch({
      displayName: 'Get My Fetch',
      make: () => ({
        key: [],
        request: () => () => {},
      }),
    });

    expect(() => {
      getFetch(makeMyFetch, state);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[getFetch] expected to see a fetch instance in get fetch."`,
    );
  });

  test("unshared: returns null and UNKNOWN if the values isn't in the store", () => {
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

    const makeExampleFetch = defineFetch({
      displayName: 'example fetch',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });
    const exampleFetch = makeExampleFetch('test arg');

    // when
    const [data, status] = getFetch(exampleFetch, state);

    // then
    expect(data).toBe(null);
    expect(isUnknown(status)).toBe(true);
  });

  test('unshared: returns null and ERROR if the value is an error', () => {
    const makeFetch = defineFetch({
      displayName: 'Example Fetch',
      make: () => ({
        key: [],
        request: () => () => {},
      }),
    });

    const fetch = makeFetch();
    const { meta } = fetch;

    const error = {};

    const initialState = dataServiceReducer({}, {});
    const errorAction = {
      type: createActionType(RESIFT_ERROR, meta),
      meta,
      payload: error,
      error: true,
    };

    const errorState = dataServiceReducer(initialState, errorAction);

    expect(errorState).toMatchInlineSnapshot(`
      Object {
        "actions": Object {
          "Example Fetch | test-short-id": Object {
            "key:": Object {
              "error": true,
              "inflight": undefined,
              "meta": Object {
                "conflict": "cancel",
                "displayName": "Example Fetch",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
                "share": undefined,
                "type": "FETCH_INSTANCE",
              },
              "payload": Object {},
              "shared": false,
              "updatedAt": "test-timestamp",
            },
          },
        },
        "shared": Object {},
      }
    `);

    const [data, status] = getFetch(fetch, { dataService: errorState });

    expect(data).toBe(null);
    expect(isError(status)).toBe(true);
  });

  test("shared: returns null and UNKNOWN if the values aren't the in the shared store", () => {
    const state = { dataService: dataServiceReducer({}, {}) };

    const makeMyFetch = defineFetch({
      displayName: 'My Fetch',
      share: { namespace: 'example' },
      make: () => ({
        key: [],
        request: () => () => {},
      }),
    });

    const myFetch = makeMyFetch();

    const result = getFetch(myFetch, state);

    expect(result).toMatchInlineSnapshot(`
      Array [
        null,
        0,
      ]
    `);
  });

  test('shared: returns a shared state if the fetch is shared', () => {
    const makeFetch = defineFetch({
      displayName: 'Example',
      share: { namespace: 'example' },
      make: () => ({
        key: [],
        request: () => () => ({ foo: 'bar' }),
      }),
    });

    const fetch = makeFetch();

    const initialState = dataServiceReducer({}, fetch());

    const { meta } = fetch;

    const successAction = {
      type: createActionType(RESIFT_SUCCESS, meta),
      meta,
      payload: { foo: 'bar' },
    };

    const successState = dataServiceReducer(initialState, successAction);

    expect(successState).toMatchInlineSnapshot(`
      Object {
        "actions": Object {
          "Example | test-short-id": Object {
            "key:": Object {
              "error": false,
              "hadSuccess": true,
              "inflight": undefined,
              "meta": Object {
                "conflict": "cancel",
                "displayName": "Example",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
                "share": Object {
                  "namespace": "example",
                },
                "type": "FETCH_INSTANCE",
              },
              "payload": Object {
                "foo": "bar",
              },
              "shared": true,
              "updatedAt": "test-timestamp",
            },
          },
        },
        "shared": Object {
          "example | key:": Object {
            "data": Object {
              "foo": "bar",
            },
            "parentActions": Object {
              "Example | test-short-id | key:": Object {
                "key": "key:",
                "storeKey": "Example | test-short-id",
              },
            },
          },
        },
      }
    `);

    const [data, status] = getFetch(fetch, { dataService: successState });

    expect(data).toMatchInlineSnapshot(`
      Object {
        "foo": "bar",
      }
    `);

    expect(isNormal(status)).toBe(true);
  });

  test('shared: isolated status', () => {
    // if isolatedStatus is true, it will grab the isolated status vs calculating
    // a shared status from the parent actions
    const makeFetchOne = defineFetch({
      displayName: 'Example One',
      share: { namespace: 'example' },
      make: () => ({
        key: [],
        request: () => () => {},
      }),
    });

    const makeFetchTwo = defineFetch({
      displayName: 'Example Two',
      share: { namespace: 'example' },
      make: () => ({
        key: [],
        request: () => () => {},
      }),
    });

    const oneFetch = makeFetchOne();
    const twoFetch = makeFetchTwo();

    const stateOne = dataServiceReducer({}, oneFetch());
    const stateTwo = dataServiceReducer(stateOne, twoFetch());

    const { meta } = oneFetch;
    const successActionOne = {
      type: createActionType(RESIFT_SUCCESS, meta),
      meta,
      payload: { one: 'done' },
    };

    const finalState = dataServiceReducer(stateTwo, successActionOne);

    expect(finalState).toMatchInlineSnapshot(`
      Object {
        "actions": Object {
          "Example One | test-short-id": Object {
            "key:": Object {
              "error": false,
              "hadSuccess": true,
              "inflight": undefined,
              "meta": Object {
                "conflict": "cancel",
                "displayName": "Example One",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
                "share": Object {
                  "namespace": "example",
                },
                "type": "FETCH_INSTANCE",
              },
              "payload": Object {
                "one": "done",
              },
              "shared": true,
              "updatedAt": "test-timestamp",
            },
          },
          "Example Two | test-short-id": Object {
            "key:": Object {
              "inflight": [Function],
              "meta": Object {
                "conflict": "cancel",
                "displayName": "Example Two",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
                "share": Object {
                  "namespace": "example",
                },
              },
              "shared": true,
              "updatedAt": "test-timestamp",
            },
          },
        },
        "shared": Object {
          "example | key:": Object {
            "data": Object {
              "one": "done",
            },
            "parentActions": Object {
              "Example One | test-short-id | key:": Object {
                "key": "key:",
                "storeKey": "Example One | test-short-id",
              },
              "Example Two | test-short-id | key:": Object {
                "key": "key:",
                "storeKey": "Example Two | test-short-id",
              },
            },
          },
        },
      }
    `);

    const isolatedStatus = getFetch(
      oneFetch,
      { dataService: finalState },
      { isolatedStatus: true },
    )[1];
    expect(isLoading(isolatedStatus)).toBe(false);

    const sharedStatus = getFetch(oneFetch, { dataService: finalState })[1];
    expect(isLoading(sharedStatus)).toBe(true);
  });
});
