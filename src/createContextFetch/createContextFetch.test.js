import React from 'react';
import { act, create } from 'react-test-renderer';
import defineFetch from '../defineFetch';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createDataService from '../createDataService';
import createContextFetch from './createContextFetch';
import dataService from '../dataServiceReducer';
import DeferredPromise from '../DeferredPromise';

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

test('createContextFetch hooks', async () => {
  const rootReducer = combineReducers({ dataService });
  const handleError = jest.fn();
  const dataServiceMiddleware = createDataService({ onError: handleError, services: {} });
  const store = createStore(rootReducer, {}, applyMiddleware(dataServiceMiddleware));
  const gotExampleValue = new DeferredPromise();

  const makeFetch = defineFetch({
    displayName: 'Get Example Fetch',
    make: id => ({
      request: x => () => ({ exampleValue: x }),
    }),
  });

  const fetch = makeFetch('123');

  const { ContextFetchProvider, useContextFetch } = createContextFetch(fetch);

  function App() {
    return (
      <ReduxProvider store={store}>
        <ContextFetchProvider>
          <Component />
        </ContextFetchProvider>
      </ReduxProvider>
    );
  }

  function Component() {
    const [data] = useContextFetch();

    const exampleValue = data?.exampleValue;

    if (exampleValue) {
      gotExampleValue.resolve(exampleValue);
    }

    if (!data) {
      return null;
    }
    return <div>{data.exampleValue}</div>;
  }

  act(() => {
    create(<App />);
  });

  await act(async () => {
    store.dispatch(fetch(5));
    const result = await gotExampleValue;
    expect(result).toMatchInlineSnapshot(`5`);
  });
});

test('createContextFetch hooks throws when there is no context value', async () => {
  const gotError = new DeferredPromise();

  class ErrorBoundary extends React.Component {
    componentDidCatch(e) {
      gotError.resolve(e);
    }

    render() {
      return this.props.children;
    }
  }

  const makeFetch = defineFetch({
    displayName: 'Example',
    make: () => ({
      request: () => () => {},
    }),
  });
  const fetch = makeFetch();

  const { useContextFetch } = createContextFetch(fetch);

  function ExampleComponent() {
    useContextFetch();
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
    `"[createContextFetch] could not find global fetch context. Did you forget to wrap this tree with the provider?"`,
  );
});

test('render props/no hooks API', async () => {
  const rootReducer = combineReducers({ dataService });
  const handleError = jest.fn();
  const dataServiceMiddleware = createDataService({ onError: handleError, services: {} });
  const store = createStore(rootReducer, {}, applyMiddleware(dataServiceMiddleware));
  const gotExampleValue = new DeferredPromise();

  const makeFetch = defineFetch({
    displayName: 'Get Example Fetch',
    make: id => ({
      request: x => () => ({ exampleValue: x }),
    }),
  });

  const fetch = makeFetch('123');

  const { ContextFetchProvider, ContextFetchConsumer } = createContextFetch(fetch);

  function App() {
    return (
      <ReduxProvider store={store}>
        <ContextFetchProvider>
          <Component />
        </ContextFetchProvider>
      </ReduxProvider>
    );
  }

  function Component() {
    return (
      <ContextFetchConsumer>
        {([data]) => {
          if (!data) {
            return null;
          }

          const exampleValue = data?.exampleValue;

          if (exampleValue) {
            gotExampleValue.resolve(exampleValue);
          }

          return <div>{data.exampleValue}</div>;
        }}
      </ContextFetchConsumer>
    );
  }

  act(() => {
    create(<App />);
  });

  await act(async () => {
    store.dispatch(fetch(5));
    const result = await gotExampleValue;
    expect(result).toMatchInlineSnapshot(`5`);
  });
});
