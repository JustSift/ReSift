import React, { useEffect } from 'react';
import { create, act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import useData from './useData';
import ResiftProvider from '../ResiftProvider';
import defineFetch from '../defineFetch';
import createDataService from '../createDataService';
import DeferredPromise from '../DeferredPromise';
import useDispatch from '../useDispatch';

// see here...
// https://github.com/facebook/react/issues/11098#issuecomment-370614347
// ...for why these exist. not an ideal solution imo but it works
beforeEach(() => {
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});
});

test('it returns null if the fetch is falsy', async () => {
  const done = new DeferredPromise();
  const dataService = createDataService({
    services: {},
    onError: (e) => {
      throw e;
    },
  });

  function ExampleComponent() {
    const error = useData(null);

    useEffect(() => {
      done.resolve(error);
    }, [error]);

    return null;
  }

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );
    await done;
  });

  const error = await done;
  expect(error).toBe(null);
});

test('it throws if a fetch factory was passed into use error instead of a fetch', async () => {
  const gotError = new DeferredPromise();

  const dataService = createDataService({
    services: {},
    onError: (e) => {
      throw e;
    },
  });

  const makeGetThing = defineFetch({
    displayName: 'Get Thing',
    make: () => ({
      request: () => () => {},
    }),
  });

  class ErrorBoundary extends React.Component {
    state = {};

    componentDidCatch(error) {
      gotError.resolve(error);
    }

    static getDerivedStateFromError() {
      return { hadError: true };
    }

    render() {
      if (this.state.hadError) return null;
      return this.props.children;
    }
  }

  function ExampleComponent() {
    useData(makeGetThing);

    return null;
  }

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ErrorBoundary>
          <ExampleComponent />
        </ErrorBoundary>
      </ResiftProvider>,
    );

    await gotError;
  });

  const error = await gotError;

  expect(error).toMatchInlineSnapshot(`[Error: [useData] expected to see a fetch instance.]`);
});

test('it throws if the state is the wrong shape', async () => {
  const gotError = new DeferredPromise();

  const mockStore = {
    getState: () => ({}),
    dispatch: () => {},
    subscribe: () => {},
  };

  const makeGetThing = defineFetch({
    displayName: 'Get Thing',
    make: () => ({
      request: () => () => {},
    }),
  });
  const getThing = makeGetThing();

  class ErrorBoundary extends React.Component {
    state = {};

    componentDidCatch(error) {
      gotError.resolve(error);
    }

    static getDerivedStateFromError() {
      return { hadError: true };
    }

    render() {
      if (this.state.hadError) return null;
      return this.props.children;
    }
  }

  function ExampleComponent() {
    useData(getThing);

    return null;
  }

  await act(async () => {
    create(
      <Provider store={mockStore}>
        <ErrorBoundary>
          <ExampleComponent />
        </ErrorBoundary>
      </Provider>,
    );

    await gotError;
  });

  const error = await gotError;

  expect(error).toMatchInlineSnapshot(
    `[Error: [useData] "dataService" is a required key. Double check with the installation guide here: https://resift.org/docs/introduction/installation]`,
  );
});

test('unshared: it grabs data from the store', async () => {
  const done = new DeferredPromise();

  const makeGetMovie = defineFetch({
    displayName: 'Get Movie',
    make: (movieId) => ({
      request: () => () => ({ id: movieId, name: 'test movie' }),
    }),
  });
  const getMovie = makeGetMovie('movie123');

  const effectHandler = jest.fn();

  const dataService = createDataService({
    services: {},
    onError: (e) => {
      throw e;
    },
  });

  function ExampleComponent() {
    const dispatch = useDispatch();
    const movie = useData(getMovie);

    useEffect(() => {
      dispatch(getMovie());
    }, [dispatch]);

    useEffect(() => {
      effectHandler(movie);
      if (movie) {
        done.resolve(movie);
      }
    }, [movie]);

    return null;
  }

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );
    await done;
  });

  const movie = await done;
  expect(effectHandler).toHaveBeenCalledTimes(2);
  expect(effectHandler.mock.calls[0][0]).toBe(null);
  expect(effectHandler.mock.calls[1][0]).toBe(movie);
});

test('shared: it grabs data from the store', async () => {
  const done = new DeferredPromise();

  const makeGetMovie = defineFetch({
    displayName: 'Get Movie',
    share: { namespace: 'movie' },
    make: (movieId) => ({
      request: () => () => ({ id: movieId, name: 'test movie' }),
    }),
  });
  const getMovie = makeGetMovie('movie123');

  const effectHandler = jest.fn();

  const dataService = createDataService({
    services: {},
    onError: (e) => {
      throw e;
    },
  });

  function ExampleComponent() {
    const dispatch = useDispatch();
    const movie = useData(getMovie);

    useEffect(() => {
      dispatch(getMovie());
    }, [dispatch]);

    useEffect(() => {
      effectHandler(movie);
      if (movie) {
        done.resolve(movie);
      }
    }, [movie]);

    return null;
  }

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );
    await done;
  });

  const movie = await done;
  expect(effectHandler).toHaveBeenCalledTimes(2);
  expect(effectHandler.mock.calls[0][0]).toBe(null);
  expect(effectHandler.mock.calls[1][0]).toBe(movie);
});
