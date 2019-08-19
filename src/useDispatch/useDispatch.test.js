import React, { useEffect } from 'react';
import { createStore } from 'redux';
import ReduxProvider from '../ReduxProvider';
import renderer, { act } from 'react-test-renderer';

import useDispatch from './useDispatch';

test('it dispatches actions to the redux store', done => {
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
    }, []);
    return null;
  });

  act(() => {
    renderer.create(
      <ReduxProvider store={store}>
        <TestComponent />
      </ReduxProvider>,
    );
  });
});
