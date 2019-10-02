import sharedReducer, { normalizeMerge, replace } from './sharedReducer';
import defineFetch from '../defineFetch';
import { isSuccessAction } from '../createDataService';
import SUCCESS from '../prefixes/SUCCESS';
import createActionType from '../createActionType';
import clearFetch from '../clearFetch';

jest.mock('shortid', () => () => 'test-short-id');

describe('normalizeMerge', () => {
  const namespace = 'testNamespace';

  test('if falsy, returns replace', () => {
    const result = normalizeMerge(null, namespace);
    expect(result).toMatchInlineSnapshot(`
          Object {
            "testNamespace": [Function],
          }
        `);
    expect(result[namespace]).toBe(replace);
  });

  test('if merge is a function, returns an object with the correct namespace', () => {
    const result = normalizeMerge(() => ({}), namespace);
    expect(result).toMatchInlineSnapshot(`
          Object {
            "testNamespace": [Function],
          }
        `);
    expect(result[namespace]).not.toBe(replace);
  });

  test('if merge is an object and does not contain the current namespace, returns an object with replace', () => {
    const result = normalizeMerge(
      {
        otherNamespace: () => ({}),
      },
      namespace,
    );
    expect(result).toMatchInlineSnapshot(`
      Object {
        "otherNamespace": [Function],
        "testNamespace": [Function],
      }
      `);
    expect(result[namespace]).toBe(replace);
  });

  test('if merge is an object but does contain the current namespace, returns the object as-is', () => {
    const mergeFn = () => ({});
    const mergeObj = {
      [namespace]: mergeFn,
    };
    const result = normalizeMerge(mergeObj, namespace);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "testNamespace": [Function],
      }
      `);
    expect(result).toBe(mergeObj);
  });

  test('if nothing matches, throw', () => {
    expect(() => {
      normalizeMerge('test', namespace);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[sharedReducer] Could not match typeof merge. See docs. (TODO add docs link)"`,
    );
  });
});

describe('sharedReducer', () => {
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

  test.only('does merges correctly', () => {
    const makeMovieListFetch = defineFetch({
      displayName: 'Get Movie List',
      share: {
        namespace: 'movieList',
        merge: {
          movieItem: (previousList, movie) => {
            if (!previousList) return null;

            const index = previousList.findIndex(i => i.id === movie.id);
            if (index === -1) return previousList;

            return [
              ...previousList.slice(0, index),
              movie,
              ...previousList.slice(index + 1, previousList.length),
            ];
          },
        },
      },
      make: () => ({
        key: [],
        request: () => ({ http }) =>
          http({
            method: 'GET',
            route: '/movies',
          }),
      }),
    });
    const makeMovieItemFetch = defineFetch({
      displayName: 'Get Movie Item',
      share: {
        namespace: 'movieItem',
        merge: {
          movieList: (previousMovie, nextList) => {
            if (!previousMovie) return null;
            return nextList.find(i => i.id === previousMovie.id);
          },
        },
      },
      make: movieId => ({
        key: [movieId],
        request: () => ({ http }) =>
          http({
            method: 'GET',
            route: `/movies/${movieId}`,
          }),
      }),
    });

    const movieListFetch = makeMovieListFetch();
    const movieItem123Fetch = makeMovieItemFetch('movie123');

    const movieListRequest = movieListFetch();
    const movieItem123Request = movieItem123Fetch();

    const requests = [movieListRequest, movieItem123Request];

    const initialState = {
      relationships: {},
      data: {},
    };
    const afterRequests = requests.reduce(sharedReducer, initialState);

    expect(afterRequests).toMatchInlineSnapshot(`
      Object {
        "data": Object {},
        "relationships": Object {
          "movieItem": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
          "movieList": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
        },
      }
    `);

    const movie123Success = {
      type: createActionType(SUCCESS, movieItem123Fetch.meta),
      meta: movieItem123Fetch.meta,
      payload: {
        id: 'movie123',
        title: 'foo',
      },
    };

    const afterMovie123Success = sharedReducer(afterRequests, movie123Success);
    expect(afterMovie123Success).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "movieItem": Object {
            "key:movie123": Object {
              "id": "movie123",
              "title": "foo",
            },
          },
          "movieList": Object {},
        },
        "relationships": Object {
          "movieItem": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
          "movieList": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
        },
      }
    `);

    const movieListSuccess = {
      type: createActionType(SUCCESS, movieListFetch.meta),
      meta: movieListFetch.meta,
      payload: [
        {
          id: 'movie123',
          title: 'CHANGED',
        },
        {
          id: 'movie456',
          title: 'foo',
        },
      ],
    };

    const afterMoveListSuccess = sharedReducer(afterMovie123Success, movieListSuccess);
    expect(afterMoveListSuccess).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "movieItem": Object {
            "key:movie123": Object {
              "id": "movie123",
              "title": "CHANGED",
            },
          },
          "movieList": Object {
            "key:": Array [
              Object {
                "id": "movie123",
                "title": "CHANGED",
              },
              Object {
                "id": "movie456",
                "title": "foo",
              },
            ],
          },
        },
        "relationships": Object {
          "movieItem": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
          "movieList": Object {
            "movieItem": [Function],
            "movieList": [Function],
          },
        },
      }
    `);
  });

  test.skip('clear fetch', () => {
    // given
    const fetchFactory = defineFetch({
      displayName: 'Get People',
      share: { namespace: 'people' },
      make: personId => ({
        key: [personId],
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
});
