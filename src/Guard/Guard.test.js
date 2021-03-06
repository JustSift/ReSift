import React, { useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import Guard from './Guard';
import defineFetch from '../defineFetch';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import dataServiceReducer from '../dataServiceReducer';
import createDataService from '../createDataService';
import { Provider } from 'react-redux';
import DeferredPromise from '../DeferredPromise';
import { makeStatusSelector } from '../useStatus/useStatus';
import useStatus from '../useStatus';
import isUnknown from '../isUnknown';
import delay from 'delay';
import isNormal from '../isNormal';
import isLoading from '../isLoading';

test('it does not render if the status does not contain NORMAL', async () => {
  const makeGetMovie = defineFetch({
    displayName: 'Get Movie',
    make: (movieId) => ({
      request: () => async () => {
        await delay(100);
        return {
          id: movieId,
          name: 'Hello World',
        };
      },
    }),
  });

  const getMovie = makeGetMovie('movie123');
  const dataService = createDataService({
    services: {},
    onError: (e) => {
      throw e;
    },
  });

  const rootReducer = combineReducers({ dataService: dataServiceReducer });
  const store = createStore(rootReducer, {}, applyMiddleware(dataService));

  // first render with UNKNOWN state, expect not to render
  expect(isUnknown(makeStatusSelector(getMovie)(store.getState()))).toBe(true);
  const guardHandler = jest.fn(() => null);

  const first = new DeferredPromise();
  const second = new DeferredPromise();
  const third = new DeferredPromise();

  let calls = 0;

  function ExampleComponent() {
    const status = useStatus(getMovie);

    useEffect(() => {
      if (calls === 0) {
        first.resolve(status);
      }

      if (calls === 1) {
        second.resolve(status);
      }

      if (calls === 2) {
        third.resolve(status);
      }

      calls += 1;
    }, [status]);

    return <Guard fetch={getMovie} children={guardHandler} />;
  }

  await act(async () => {
    create(
      <Provider store={store}>
        <ExampleComponent />
      </Provider>,
    );

    // first render with UNKNOWN state
    const firstStatus = await first;
    expect(isUnknown(firstStatus)).toBe(true);
    expect(guardHandler).not.toHaveBeenCalled();

    // second render with LOADING state
    store.dispatch(getMovie());
    const secondStatus = await second;
    expect(isLoading(secondStatus)).toBe(true);
    expect(guardHandler).not.toHaveBeenCalled();

    // third render with NORMAL state
    const thirdStatus = await third;
    expect(isNormal(thirdStatus)).toBe(true);
    expect(guardHandler).toHaveBeenCalled();

    await delay(500);
  });
});
