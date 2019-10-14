import React, { useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import { Provider } from 'react-redux';
import delay from 'delay';
import _noop from 'lodash/noop';
import useError from './useError';
import useDispatch from '../useDispatch';
import useStatus from '../useStatus';
import DeferredPromise from '../DeferredPromise';
import ResiftProvider from '../ResiftProvider';
import createDataService from '../createDataService';
import defineFetch from '../defineFetch';
import isLoading from '../isLoading';
import isError from '../isError';

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
    onError: e => {
      throw e;
    },
  });

  function ExampleComponent() {
    const error = useError(null);

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
    onError: e => {
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
    useError(makeGetThing);

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

  expect(error).toMatchInlineSnapshot(
    `[Error: An error occured while selecting the store state: [useError] expected to see a fetch instance..]`,
  );
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
    useError(getThing);

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
    `[Error: An error occured while selecting the store state: [useError] "dataService" is a required key. Double check with the installation guide here: https://resift.org/docs/introduction/installation.]`,
  );
});

test('it returns null if there is no action state', async () => {
  const gotError = new DeferredPromise();

  const dataService = createDataService({
    services: {},
    onError: e => {
      throw e;
    },
  });

  const makeGetThing = defineFetch({
    displayName: 'Get Thing',
    make: () => ({
      request: () => () => {},
    }),
  });

  const getThing = makeGetThing();

  function ExampleComponent() {
    const error = useError(getThing);

    useEffect(() => {
      gotError.resolve(error);
    }, [error]);

    return null;
  }

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );

    await gotError;
  });

  const error = await gotError;
  expect(error).toBe(null);
});

test('it return null if the errorData is undefined', async () => {
  const gotError = new DeferredPromise();

  const dataService = createDataService({
    services: {},
    onError: e => {
      throw e;
    },
  });

  const makeGetThing = defineFetch({
    displayName: 'Get Thing',
    make: () => ({
      request: () => async () => {
        await delay(100);
        return { hello: 'world' };
      },
    }),
  });
  const getThing = makeGetThing();

  function ExampleComponent() {
    const dispatch = useDispatch();
    const error = useError(getThing);
    const status = useStatus(getThing);

    useEffect(() => {
      dispatch(getThing());
    }, [dispatch]);

    const loading = isLoading(status);

    useEffect(() => {
      if (loading) {
        gotError.resolve(error);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    return null;
  }

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );
    await gotError;
  });

  const error = await gotError;

  expect(error).toBe(null);
});

test('it returns the error if there is one', async () => {
  const gotError = new DeferredPromise();

  const makeGetThing = defineFetch({
    displayName: 'Get Thing',
    make: () => ({
      request: () => () => {
        throw new Error('test error');
      },
    }),
  });

  const dataService = createDataService({
    services: {},
    onError: e => {},
  });

  const getThing = makeGetThing();

  function ExampleComponent() {
    const dispatch = useDispatch();
    const error = useError(getThing);
    const status = useStatus(getThing);

    useEffect(() => {
      dispatch(getThing()).catch(_noop);
    }, [dispatch]);

    useEffect(() => {
      if (isError(status)) {
        gotError.resolve(error);
      }
    }, [error, status]);

    return null;
  }

  await act(async () => {
    create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );

    await gotError;
  });

  const error = await gotError;

  expect(error).toMatchInlineSnapshot(`[Error: test error]`);
});
