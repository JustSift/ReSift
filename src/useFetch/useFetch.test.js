import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import defineFetch from '../defineFetch';
import createActionType from '../createActionType';
import SUCCESS from '../prefixes/SUCCESS';
import dataServiceReducer from '../dataServiceReducer';

import useFetch from './useFetch';

test('it gets the fetch and returns the data and loading state', () => {
  // given
  const makePersonFetch = defineFetch({
    displayName: 'fetch person',
    make: personId => ({
      key: [personId],
      fetch: () => ({ exampleService }) => exampleService(personId),
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
    const [data, loadingState] = useFetch(personFetch);
    return <MockComponent data={data} loadingState={loadingState} />;
  }

  act(() => {
    // when
    renderer.create(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
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
  "loadingState": 1,
}
`);
});

test('it bails out of updating if the data does not change', () => {
  // given
  const makePersonFetch = defineFetch({
    displayName: 'fetch person',
    make: personId => ({
      key: [personId],
      fetch: () => ({ exampleService }) => exampleService(personId),
    }),
  });

  const makeOtherFetch = defineFetch({
    displayName: 'fetch other',
    make: otherId => ({
      key: [otherId],
      fetch: () => ({ exampleService }) => exampleService(otherId),
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
    const [data, loadingState] = useFetch(personFetch);
    return <MockComponent data={data} loadingState={loadingState} />;
  }

  const amountToDispatchOtherAction = 5;

  act(() => {
    renderer.create(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    );

    // when
    for (let i = 0; i < amountToDispatchOtherAction; i += 1) {
      store.dispatch(otherSuccessAction);
    }
  });

  expect(MockComponent).toHaveBeenCalledTimes(1);
  expect(mockStoreHandler).toHaveBeenCalledTimes(amountToDispatchOtherAction);
});
