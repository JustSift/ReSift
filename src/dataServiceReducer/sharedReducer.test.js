import sharedReducer from './sharedReducer';
import defineFetch from '../defineFetch';
import { isSuccessAction } from '../createDataService';
import SUCCESS from '../prefixes/SUCCESS';
import createActionType from '../createActionType';
import clearFetch from '../clearFetch';

jest.mock('nanoid', () => () => 'test-short-id');

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

test('shared merges bidirectional case', () => {
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

  const afterRequests = requests.reduce(sharedReducer, null);

  expect(afterRequests).toMatchInlineSnapshot(`
    Object {
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
});

test('shared merges one way case', () => {
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
      // NOTE: there are no custom merges here
    },
    make: movieId => ({
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

  const afterRequests = requests.reduce(sharedReducer, null);

  expect(afterRequests).toMatchInlineSnapshot(`
    Object {
      "merges": Object {
        "movieItem": Object {
          "movieItem": [Function],
          "movieList": [Function],
        },
        "movieList": Object {
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
      "merges": Object {
        "movieItem": Object {
          "movieItem": [Function],
          "movieList": [Function],
        },
        "movieList": Object {
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
            "title": "foo",
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
      "merges": Object {
        "movieItem": Object {
          "movieItem": [Function],
          "movieList": [Function],
        },
        "movieList": Object {
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
});

test('clear fetch', () => {
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

  const afterRequests = requests.reduce(sharedReducer, null);

  expect(afterRequests).toMatchInlineSnapshot(`
    Object {
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

  const clearAction = clearFetch(movieListFetch);

  const afterClear = sharedReducer(afterMoveListSuccess, clearAction);

  expect(afterClear).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "movieItem": Object {
          "key:movie123": Object {
            "id": "movie123",
            "title": "CHANGED",
          },
        },
      },
      "merges": Object {
        "movieItem": Object {
          "movieItem": [Function],
        },
        "movieList": Object {
          "movieItem": [Function],
        },
      },
      "parents": Object {
        "movieItem": Object {
          "Get Movie Item | key:movie123 | test-short-id": Object {
            "displayName": "Get Movie Item",
            "fetchFactoryId": "test-short-id",
            "key": "key:movie123",
          },
        },
      },
    }
  `);
});
