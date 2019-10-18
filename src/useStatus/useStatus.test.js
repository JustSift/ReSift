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

import { makeStatusSelector, getStatus, combineSharedStatuses } from './useStatus';

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

describe('useStatus', () => {
  test('throws if there is no state', () => {
    expect(() => {
      const makeFetch = defineFetch({
        displayName: 'Test',
        make: () => ({
          request: () => () => {},
        }),
      });
      const fetch = makeFetch();

      const noState = undefined;

      makeStatusSelector(fetch)(noState);
    }).toThrowErrorMatchingInlineSnapshot(`"Cannot read property 'dataService' of undefined"`);
  });

  test('throws if there is no data service key', () => {
    expect(() => {
      const makeFetch = defineFetch({
        displayName: 'Test',
        make: () => ({
          request: () => () => {},
        }),
      });
      const fetch = makeFetch();

      const noState = {};

      makeStatusSelector(fetch)(noState);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[useStatus] \\"dataService\\" is a required key. Double check with the installation guide here: https://resift.org/docs/introduction/installation"`,
    );
  });

  test("throws if a fetch instance wasn't passed in", () => {
    const state = { dataService: dataServiceReducer({}, {}) };
    expect(state).toMatchInlineSnapshot(`
      Object {
        "dataService": Object {
          "actions": Object {},
          "shared": Object {
            "data": Object {},
            "merges": Object {},
            "parents": Object {},
          },
        },
      }
    `);

    const makeMyFetch = defineFetch({
      displayName: 'Get My Fetch',
      make: () => ({
        request: () => () => {},
      }),
    });

    expect(() => {
      makeStatusSelector(makeMyFetch)(state);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[useStatus] expected to see a fetch instance in get fetch."`,
    );
  });

  test("unshared: returns UNKNOWN if the values isn't in the store", () => {
    // given
    const state = { dataService: dataServiceReducer({}, {}) };
    expect(state).toMatchInlineSnapshot(`
      Object {
        "dataService": Object {
          "actions": Object {},
          "shared": Object {
            "data": Object {},
            "merges": Object {},
            "parents": Object {},
          },
        },
      }
    `);

    const makeExampleFetch = defineFetch({
      displayName: 'example fetch',
      make: testArg => ({
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });
    const exampleFetch = makeExampleFetch('test arg');

    // when
    const status = makeStatusSelector(exampleFetch)(state);

    // then
    expect(isUnknown(status)).toBe(true);
  });

  test('unshared: returns ERROR if the value is an error', () => {
    const makeFetch = defineFetch({
      displayName: 'Example Fetch',
      make: () => ({
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
              "errorData": Object {},
              "inflight": undefined,
              "meta": Object {
                "conflict": "cancel",
                "displayName": "Example Fetch",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
                "share": undefined,
                "type": "FETCH_INSTANCE",
              },
              "shared": false,
              "updatedAt": "test-timestamp",
            },
          },
        },
        "shared": Object {
          "data": Object {},
          "merges": Object {},
          "parents": Object {},
        },
      }
    `);

    const status = makeStatusSelector(fetch)({ dataService: errorState });

    expect(isError(status)).toBe(true);
  });

  test("shared: returns UNKNOWN if the values aren't the in the shared store", () => {
    const state = { dataService: dataServiceReducer({}, {}) };

    const makeMyFetch = defineFetch({
      displayName: 'My Fetch',
      share: { namespace: 'example' },
      make: () => ({
        request: () => () => {},
      }),
    });

    const myFetch = makeMyFetch();

    const status = makeStatusSelector(myFetch)(state);

    expect(isUnknown(status)).toBe(true);
  });

  test('shared: returns a shared status if the fetch is shared', () => {
    const makeFetch = defineFetch({
      displayName: 'Example',
      share: { namespace: 'example' },
      make: () => ({
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
              "data": Object {
                "foo": "bar",
              },
              "error": false,
              "errorData": null,
              "hadSuccess": true,
              "inflight": undefined,
              "meta": Object {
                "conflict": "cancel",
                "displayName": "Example",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
                "share": Object {
                  "mergeObj": Object {
                    "example": [Function],
                  },
                  "namespace": "example",
                },
                "type": "FETCH_INSTANCE",
              },
              "shared": true,
              "updatedAt": "test-timestamp",
            },
          },
        },
        "shared": Object {
          "data": Object {
            "example": Object {
              "key:": Object {
                "foo": "bar",
              },
            },
          },
          "merges": Object {
            "example": Object {
              "example": [Function],
            },
          },
          "parents": Object {
            "example": Object {
              "Example | key: | test-short-id": Object {
                "displayName": "Example",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
              },
            },
          },
        },
      }
    `);

    const status = makeStatusSelector(fetch)({ dataService: successState });
    expect(isNormal(status)).toBe(true);
  });

  test('shared: isolated status', () => {
    // if isolatedStatus is true, it will grab the isolated status vs calculating
    // a shared status from the parent actions
    const makeFetchOne = defineFetch({
      displayName: 'Example One',
      share: { namespace: 'example' },
      make: () => ({
        request: () => () => {},
      }),
    });

    const makeFetchTwo = defineFetch({
      displayName: 'Example Two',
      share: { namespace: 'example' },
      make: () => ({
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
              "data": Object {
                "one": "done",
              },
              "error": false,
              "errorData": null,
              "hadSuccess": true,
              "inflight": undefined,
              "meta": Object {
                "conflict": "cancel",
                "displayName": "Example One",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
                "share": Object {
                  "mergeObj": Object {
                    "example": [Function],
                  },
                  "namespace": "example",
                },
                "type": "FETCH_INSTANCE",
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
                  "mergeObj": Object {
                    "example": [Function],
                  },
                  "namespace": "example",
                },
              },
              "shared": true,
              "updatedAt": "test-timestamp",
            },
          },
        },
        "shared": Object {
          "data": Object {
            "example": Object {
              "key:": Object {
                "one": "done",
              },
            },
          },
          "merges": Object {
            "example": Object {
              "example": [Function],
            },
          },
          "parents": Object {
            "example": Object {
              "Example One | key: | test-short-id": Object {
                "displayName": "Example One",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
              },
              "Example Two | key: | test-short-id": Object {
                "displayName": "Example Two",
                "fetchFactoryId": "test-short-id",
                "key": "key:",
              },
            },
          },
        },
      }
    `);

    const isolatedStatus = makeStatusSelector(oneFetch, { isolatedStatus: true })({
      dataService: finalState,
    });
    expect(isLoading(isolatedStatus)).toBe(false);

    const sharedStatus = makeStatusSelector(oneFetch)({ dataService: finalState });
    expect(isLoading(sharedStatus)).toBe(true);
  });

  test('shared statuses, multiple keys, shared namespaces fetches', () => {
    const makeGetMovieItem = defineFetch({
      displayName: 'Get Movie Item',
      share: {
        namespace: 'movieItem',
        merge: {
          movieList: (prevMovie, nextList) => {
            if (!prevMovie) return null;

            return nextList.find(movie => movie.id === prevMovie.id);
          },
        },
      },
      make: id => ({
        request: () => () => {},
      }),
    });
    const makeGetMovieList = defineFetch({
      displayName: 'Get Movie List',
      share: {
        namespace: 'movieList',
        merge: {
          movieItem: (prevList, nextItem) => {
            if (!prevList) return null;

            const index = prevList.findIndex(movie => movie.id === nextItem.id);

            return [
              ...prevList.slice(0, index),
              nextItem,
              ...prevList.slice(index + 1, prevList.length),
            ];
          },
        },
      },
      make: () => ({
        request: () => () => {},
      }),
    });

    const getMovieList = makeGetMovieList();
    const getMovieItem123 = makeGetMovieItem('movie123');
    const getMovieItem456 = makeGetMovieItem('movie456');

    const initialState = dataServiceReducer({}, { type: 'NO_MATCH' });
    expect(initialState).toMatchInlineSnapshot(`
      Object {
        "actions": Object {},
        "shared": Object {
          "data": Object {},
          "merges": Object {},
          "parents": Object {},
        },
      }
    `);

    const movieListRequest = getMovieList();
    const movieItem123Request = getMovieItem123();
    const movieItem456Request = getMovieItem456();

    const requests = [movieListRequest, movieItem123Request, movieItem456Request];

    const afterFetches = requests.reduce(dataServiceReducer, initialState);
    expect(afterFetches.shared).toMatchInlineSnapshot(`
      Object {
        "data": Object {},
        "merges": Object {
          "movieItem": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
          "movieList": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
        },
        "parents": Object {
          "movieItem": Object {
            "Get Movie Item | key:movie123 | test-short-id": Object {
              "displayName": "Get Movie Item",
              "fetchFactoryId": "test-short-id",
              "key": "key:movie123",
            },
            "Get Movie Item | key:movie456 | test-short-id": Object {
              "displayName": "Get Movie Item",
              "fetchFactoryId": "test-short-id",
              "key": "key:movie456",
            },
          },
          "movieList": Object {
            "Get Movie List | key: | test-short-id": Object {
              "displayName": "Get Movie List",
              "fetchFactoryId": "test-short-id",
              "key": "key:",
            },
          },
        },
      }
    `);

    const movieListSuccess = {
      type: createActionType(RESIFT_SUCCESS, movieListRequest.meta),
      meta: movieListRequest.meta,
      payload: [
        { id: 'movie123', name: 'foo' },
        { id: 'movie456', name: 'bar' },
        { id: 'movie789', name: 'baz' },
      ],
    };

    const afterMovieListSuccess = dataServiceReducer(afterFetches, movieListSuccess);
    expect(afterMovieListSuccess.shared).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "movieItem": Object {},
          "movieList": Object {
            "key:": Array [
              Object {
                "id": "movie123",
                "name": "foo",
              },
              Object {
                "id": "movie456",
                "name": "bar",
              },
              Object {
                "id": "movie789",
                "name": "baz",
              },
            ],
          },
        },
        "merges": Object {
          "movieItem": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
          "movieList": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
        },
        "parents": Object {
          "movieItem": Object {
            "Get Movie Item | key:movie123 | test-short-id": Object {
              "displayName": "Get Movie Item",
              "fetchFactoryId": "test-short-id",
              "key": "key:movie123",
            },
            "Get Movie Item | key:movie456 | test-short-id": Object {
              "displayName": "Get Movie Item",
              "fetchFactoryId": "test-short-id",
              "key": "key:movie456",
            },
          },
          "movieList": Object {
            "Get Movie List | key: | test-short-id": Object {
              "displayName": "Get Movie List",
              "fetchFactoryId": "test-short-id",
              "key": "key:",
            },
          },
        },
      }
    `);

    const movieItem123Success = {
      type: createActionType(RESIFT_SUCCESS, movieItem123Request.meta),
      meta: movieItem123Request.meta,
      payload: {
        id: 'movie123',
        name: 'foo CHANGED',
      },
    };
    const afterMovieItem123Success = dataServiceReducer(afterMovieListSuccess, movieItem123Success);
    expect(afterMovieItem123Success.shared).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "movieItem": Object {
            "key:movie123": Object {
              "id": "movie123",
              "name": "foo CHANGED",
            },
          },
          "movieList": Object {
            "key:": Array [
              Object {
                "id": "movie123",
                "name": "foo CHANGED",
              },
              Object {
                "id": "movie456",
                "name": "bar",
              },
              Object {
                "id": "movie789",
                "name": "baz",
              },
            ],
          },
        },
        "merges": Object {
          "movieItem": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
          "movieList": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
        },
        "parents": Object {
          "movieItem": Object {
            "Get Movie Item | key:movie123 | test-short-id": Object {
              "displayName": "Get Movie Item",
              "fetchFactoryId": "test-short-id",
              "key": "key:movie123",
            },
            "Get Movie Item | key:movie456 | test-short-id": Object {
              "displayName": "Get Movie Item",
              "fetchFactoryId": "test-short-id",
              "key": "key:movie456",
            },
          },
          "movieList": Object {
            "Get Movie List | key: | test-short-id": Object {
              "displayName": "Get Movie List",
              "fetchFactoryId": "test-short-id",
              "key": "key:",
            },
          },
        },
      }
    `);

    const movieItem456Success = {
      type: createActionType(RESIFT_SUCCESS, movieItem456Request.meta),
      meta: movieItem456Request.meta,
      payload: {
        id: 'movie456',
        name: 'bar CHANGED',
      },
    };
    const afterMovieItem456Success = dataServiceReducer(
      afterMovieItem123Success,
      movieItem456Success,
    );

    expect(afterMovieItem456Success.shared).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "movieItem": Object {
            "key:movie123": Object {
              "id": "movie123",
              "name": "foo CHANGED",
            },
            "key:movie456": Object {
              "id": "movie456",
              "name": "bar CHANGED",
            },
          },
          "movieList": Object {
            "key:": Array [
              Object {
                "id": "movie123",
                "name": "foo CHANGED",
              },
              Object {
                "id": "movie456",
                "name": "bar CHANGED",
              },
              Object {
                "id": "movie789",
                "name": "baz",
              },
            ],
          },
        },
        "merges": Object {
          "movieItem": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
          "movieList": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
        },
        "parents": Object {
          "movieItem": Object {
            "Get Movie Item | key:movie123 | test-short-id": Object {
              "displayName": "Get Movie Item",
              "fetchFactoryId": "test-short-id",
              "key": "key:movie123",
            },
            "Get Movie Item | key:movie456 | test-short-id": Object {
              "displayName": "Get Movie Item",
              "fetchFactoryId": "test-short-id",
              "key": "key:movie456",
            },
          },
          "movieList": Object {
            "Get Movie List | key: | test-short-id": Object {
              "displayName": "Get Movie List",
              "fetchFactoryId": "test-short-id",
              "key": "key:",
            },
          },
        },
      }
    `);

    (() => {
      const status = makeStatusSelector(getMovieItem456)({
        dataService: afterMovieItem123Success,
      });
      expect(status).toMatchInlineSnapshot(`2`);
      expect(isNormal(status)).toBe(false);
    })();

    (() => {
      const status = makeStatusSelector(getMovieItem456)({
        dataService: afterMovieItem456Success,
      });
      expect(status).toMatchInlineSnapshot(`1`);
      expect(isNormal(status)).toBe(true);
    })();
  });

  test.only('shared statuses: deleting an item', () => {
    const makeGetNoteList = defineFetch({
      staticFetchFactoryId: 'get-note-list',
      displayName: 'Get Note List',
      share: {
        namespace: 'noteList',
        merge: {
          noteItem: (prevNoteList, nextNoteItem) => {
            if (!prevNoteList) return null;

            const index = prevNoteList.findIndex(note => note.id === nextNoteItem.id);

            if (index === -1) {
              return prevNoteList;
            }

            if (nextNoteItem.deleted) {
              return prevNoteList.filter(note => note.id !== nextNoteItem.id);
            }

            return [
              ...prevNoteList.slice(0, index),
              nextNoteItem,
              ...prevNoteList.slice(index + 1, prevNoteList.length),
            ];
          },
          newNoteItem: (prevNoteList, newNoteItem) => {
            if (!prevNoteList) return null;

            return [...prevNoteList, newNoteItem];
          },
        },
      },
      make: () => ({
        request: () => ({ http }) =>
          http({
            method: 'GET',
            route: '/notes',
          }),
      }),
    });

    const makeDeleteNoteItem = defineFetch({
      staticFectFactoryId: 'delete-note',
      displayName: 'Delete Note Item',
      share: { namespace: 'noteItem' },
      make: noteId => ({
        request: updatedNote => async ({ http }) => {
          // server doesn't return anything...
          await http({
            method: 'DELETE',
            route: `/notes/${noteId}`,
          });

          // ...so return an entity with a deleted flag
          return { id: noteId, deleted: true };
        },
      }),
    });

    const getNoteList = makeGetNoteList();
    const deleteNoteItem123 = makeDeleteNoteItem('note123');

    const noteListSuccess = {
      type: createActionType(RESIFT_SUCCESS, getNoteList.meta),
      meta: getNoteList.meta,
      payload: [
        {
          id: 'note123',
          content: 'bar',
        },
        {
          id: 'note456',
          content: 'foo',
        },
      ],
    };

    const state = [{ type: 'first' }, getNoteList(), noteListSuccess, deleteNoteItem123()].reduce(
      dataServiceReducer,
      {},
    );

    const status = makeStatusSelector(getNoteList)({ dataService: state });

    expect(isLoading(status)).toBe(true);
  });
});
