import React, { useEffect } from 'react';
import renderer, { act } from 'react-test-renderer';
import { createStore } from 'redux';

import { Provider as ReduxProvider } from 'react-redux';
import defineFetch from '../defineFetch';
import createActionType from '../createActionType';
import SUCCESS from '../prefixes/SUCCESS';
import dataServiceReducer from '../dataServiceReducer';
import DeferredPromise from '../DeferredPromise';
import createDataService from '../createDataService';
import ResiftProvider from '../ResiftProvider';

import useFetch from './useFetch';

test('it gets the fetch and returns the data and status', () => {
  // given
  const makePersonFetch = defineFetch({
    displayName: 'fetch person',
    make: personId => ({
      key: [personId],
      request: () => ({ exampleService }) => exampleService(personId),
    }),
  });

  const fetchAction = makePersonFetch('person123')();
  const successAction = {
    type: createActionType(SUCCESS, fetchAction.meta),
    meta: fetchAction.meta,
    payload: {
      mock: 'data',
    },
  };

  const store = createStore((state = {}, action) => {
    return {
      ...state,
      dataService: dataServiceReducer(state.dataService, action),
    };
  });
  store.dispatch(successAction);

  const MockComponent = jest.fn(() => null);
  function TestComponent() {
    const personFetch = makePersonFetch('person123');
    const [data, status] = useFetch(personFetch);
    return <MockComponent data={data} status={status} />;
  }

  act(() => {
    // when
    renderer.create(
      <ReduxProvider store={store}>
        <TestComponent />
      </ReduxProvider>,
    );
  });

  // then
  expect(MockComponent).toHaveBeenCalledTimes(1);
  const injectedProps = MockComponent.mock.calls[0][0];

  expect(injectedProps).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "mock": "data",
      },
      "status": 1,
    }
  `);
});

test('it bails out of updating if the data does not change', () => {
  // given
  const makePersonFetch = defineFetch({
    displayName: 'fetch person',
    make: personId => ({
      key: [personId],
      request: () => ({ exampleService }) => exampleService(personId),
    }),
  });

  const makeOtherFetch = defineFetch({
    displayName: 'fetch other',
    make: otherId => ({
      key: [otherId],
      request: () => ({ exampleService }) => exampleService(otherId),
    }),
  });

  const personFetch = makePersonFetch('person123');
  const fetchAction = personFetch();
  const successAction = {
    type: createActionType(SUCCESS, fetchAction.meta),
    meta: fetchAction.meta,
    payload: {
      mock: 'data',
    },
  };

  const otherFetchAction = makeOtherFetch('other123')();
  const otherSuccessAction = {
    type: createActionType(SUCCESS, otherFetchAction.meta),
    meta: otherFetchAction.meta,
    payload: {
      something: 'else',
    },
  };

  const store = createStore((state = {}, action) => {
    return {
      ...state,
      dataService: dataServiceReducer(state.dataService, action),
    };
  });
  store.dispatch(successAction);

  const mockStoreHandler = jest.fn();
  store.subscribe(mockStoreHandler);

  const MockComponent = jest.fn(() => null);
  function TestComponent() {
    const [data, status] = useFetch(personFetch);
    return <MockComponent data={data} status={status} />;
  }

  const amountToDispatchOtherAction = 5;

  act(() => {
    renderer.create(
      <ReduxProvider store={store}>
        <TestComponent />
      </ReduxProvider>,
    );

    // when
    for (let i = 0; i < amountToDispatchOtherAction; i += 1) {
      store.dispatch(otherSuccessAction);
    }
  });

  expect(MockComponent).toHaveBeenCalledTimes(1);
  expect(mockStoreHandler).toHaveBeenCalledTimes(amountToDispatchOtherAction);
});

test('accepts falsy value', async () => {
  const gotResult = new DeferredPromise();
  const handleError = jest.fn();

  const dataService = createDataService({
    services: {},
    onError: handleError,
  });

  function ExampleComponent() {
    const result = useFetch(null);

    useEffect(() => {
      gotResult.resolve(result);
    }, [result]);

    return <div>example</div>;
  }

  await act(async () => {
    renderer.create(
      <ResiftProvider dataService={dataService}>
        <ExampleComponent />
      </ResiftProvider>,
    );

    await gotResult;
  });

  const result = await gotResult;
  expect(result).toMatchInlineSnapshot(`
    Array [
      null,
      0,
    ]
  `);
});
