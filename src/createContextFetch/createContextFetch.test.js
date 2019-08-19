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

  await act(async () => {
    store.dispatch(fetch(5));
    const result = await gotExampleValue;
    expect(result).toMatchInlineSnapshot(`5`);
  });
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

  await act(async () => {
    store.dispatch(fetch(5));
    const result = await gotExampleValue;
    expect(result).toMatchInlineSnapshot(`5`);
  });
});
