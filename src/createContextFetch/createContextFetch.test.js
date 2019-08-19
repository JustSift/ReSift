import React from 'react';
import _get from 'lodash/get';
import { act, create } from 'react-test-renderer';
import defineFetch from '../defineFetch';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createDataService from '../createDataService';
import createContextFetch from './createContextFetch';
import dataService from '../dataServiceReducer';
import DeferredPromise from '../DeferredPromise';

// TODO (8/5): this work properly in a real environment but the test is currently always spitting out
// "Warning: An update to ContextFetchProvider inside a test was not wrapped in act(...)"
// when react 16.9 goes lives, this false error should _probably_ go away
test('createContextFetch hooks', async () => {
  const rootReducer = combineReducers({ dataService });
  const handleError = jest.fn();
  const dataServiceMiddleware = createDataService({ onError: handleError, services: {} });
  const store = createStore(rootReducer, {}, applyMiddleware(dataServiceMiddleware));
  const gotExampleValue = new DeferredPromise();

  const makeFetch = defineFetch({
    displayName: 'Get Example Fetch',
    make: id => ({
      key: [id],
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

    const exampleValue = _get(data, ['exampleValue']);

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

  act(() => {
    store.dispatch(fetch(5));
  });

  const result = await gotExampleValue;
  expect(result).toMatchInlineSnapshot(`5`);
});

// TODO (8/5): this work properly in a real environment but the test is currently always spitting out
// "Warning: An update to ContextFetchProvider inside a test was not wrapped in act(...)"
// when react 16.9 goes lives, this false error should _probably_ go away
test('render props/no hooks API', async () => {
  const rootReducer = combineReducers({ dataService });
  const handleError = jest.fn();
  const dataServiceMiddleware = createDataService({ onError: handleError, services: {} });
  const store = createStore(rootReducer, {}, applyMiddleware(dataServiceMiddleware));
  const gotExampleValue = new DeferredPromise();

  const makeFetch = defineFetch({
    displayName: 'Get Example Fetch',
    make: id => ({
      key: [id],
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

          const exampleValue = _get(data, ['exampleValue']);

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

  act(() => {
    store.dispatch(fetch(5));
  });

  const result = await gotExampleValue;
  expect(result).toMatchInlineSnapshot(`5`);
});
