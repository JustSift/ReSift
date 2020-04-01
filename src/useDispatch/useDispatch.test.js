import React, { useEffect } from 'react';
import { createStore } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { act, create } from 'react-test-renderer';
import DeferredPromise from '../DeferredPromise';
import defineFetch from '../defineFetch';

import useDispatch from './useDispatch';

// see here...
// https://github.com/facebook/react/issues/11098#issuecomment-370614347
// ...for why these exist. not an ideal solution imo but it works
beforeEach(() => {
  jest.spyOn(console, 'error');
  global.console.error.mockImplementation(() => {});
});

afterEach(() => {
  global.console.error.mockRestore();
});

test('it throws if there is no provider', async () => {
  const gotError = new DeferredPromise();

  class ErrorBoundary extends React.Component {
    componentDidCatch(e) {
      gotError.resolve(e);
    }

    render() {
      return this.props.children;
    }
  }

  function ExampleComponent() {
    useDispatch();

    return null;
  }

  await act(async () => {
    create(
      <ErrorBoundary>
        <ExampleComponent />
      </ErrorBoundary>,
    );

    await gotError;
  });

  const error = await gotError;

  expect(error.message).toMatchInlineSnapshot(
    `"[useDispatch] Could not find the respective context. In order to \`useDispatch\` you must add the respective provider. https://resift.org/docs/introduction/installation#adding-the-resiftprovider"`,
  );
});

test('it dispatches actions to the redux store', (done) => {
  const store = createStore((state, action) => {
    if (action.type === 'TEST_ACTION') {
      return {
        gotAction: true,
      };
    }

    return state;
  });

  store.subscribe(() => {
    if (store.getState().gotAction) {
      done();
    }
  });

  const TestComponent = jest.fn(() => {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch({ type: 'TEST_ACTION' });
    }, [dispatch]);
    return null;
  });

  act(() => {
    create(
      <ReduxProvider store={store}>
        <TestComponent />
      </ReduxProvider>,
    );
  });
});

test('it returns unwrapped store.dispatch in production', async () => {
  const nodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const done = new DeferredPromise();
  expect(process.env.NODE_ENV).toBe('production');

  const dispatch = () => {};

  const store = {
    dispatch,
    getState: () => ({}),
    subscribe: () => {},
  };

  function ExampleComponent() {
    const dispatch = useDispatch();

    useEffect(() => {
      done.resolve(dispatch);
    }, [dispatch]);

    return null;
  }

  await act(async () => {
    create(
      <ReduxProvider store={store}>
        <ExampleComponent />
      </ReduxProvider>,
    );

    await done;
  });

  const result = await done;
  expect(result).toBe(dispatch);

  process.env.NODE_ENV = nodeEnv;
});

test('throws when you dispatch a fetch instance instead of calling it', async () => {
  const makeFetch = defineFetch({
    displayName: 'Example',
    make: () => ({
      request: () => () => {},
    }),
  });

  const gotError = new DeferredPromise();
  class ErrorBoundary extends React.Component {
    componentDidCatch(e) {
      gotError.resolve(e);
    }

    render() {
      return this.props.children;
    }
  }

  function ExampleComponent() {
    const dispatch = useDispatch();

    const fetch = makeFetch();

    useEffect(() => {
      dispatch(fetch); // don't do this lol
    }, [dispatch, fetch]);

    return null;
  }

  const store = createStore(() => ({}));

  await act(async () => {
    create(
      <ErrorBoundary>
        <ReduxProvider store={store}>
          <ExampleComponent />
        </ReduxProvider>
      </ErrorBoundary>,
    );

    await gotError;
  });

  const error = await gotError;

  expect(error.message).toMatchInlineSnapshot(
    `"[useDispatch] You dispatched a fetch instance without calling it when you should've dispatched a request."`,
  );
});

test('throws when you dispatch a fetch factory', async () => {
  const makeFetch = defineFetch({
    displayName: 'Example',
    make: () => ({
      request: () => () => {},
    }),
  });

  const gotError = new DeferredPromise();
  class ErrorBoundary extends React.Component {
    componentDidCatch(e) {
      gotError.resolve(e);
    }

    render() {
      return this.props.children;
    }
  }

  function ExampleComponent() {
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(makeFetch); // don't do this lol
    }, [dispatch]);

    return null;
  }

  const store = createStore(() => ({}));

  await act(async () => {
    create(
      <ErrorBoundary>
        <ReduxProvider store={store}>
          <ExampleComponent />
        </ReduxProvider>
      </ErrorBoundary>,
    );

    await gotError;
  });

  const error = await gotError;

  expect(error.message).toMatchInlineSnapshot(
    `"[useDispatch] You dispatched a fetch factory when you should've dispatched a request."`,
  );
});
