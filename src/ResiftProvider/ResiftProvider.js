import React, { useMemo, useReducer, useEffect, useCallback } from 'react';
import usePull from 'use-pull';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import SubscriptionContext from '../SubscriptionContext';
import dataServiceReducer from '../dataServiceReducer';

function ResiftProvider({ children, dataService }) {
  if (!dataService) {
    throw new Error('[ResiftProvider] `dataService` missing from props.');
  }

  const [state, rawDispatch] = useReducer(dataServiceReducer, {});
  const getState = usePull(state);

  const dispatch = useCallback(
    async action => {
      rawDispatch(action);
      const state = getState();
      await dataService(state, rawDispatch, action);
    },
    [getState, dataService],
  );

  const { notify, subscribe } = useMemo(() => {
    const subscriptions = new Set();

    const notify = state => {
      // eslint-bug
      // eslint-disable-next-line no-unused-vars
      for (const subscription of subscriptions) {
        subscription(state);
      }
    };

    const subscribe = subscription => {
      subscriptions.add(subscription);

      const unsubscribe = () => {
        subscriptions.delete(subscription);
      };

      return unsubscribe;
    };

    return { subscribe, notify };
  }, []);

  useEffect(() => {
    notify(state);
  }, [state, notify]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <SubscriptionContext.Provider value={subscribe}>
        <StateContext.Provider value={state}>{children}</StateContext.Provider>
      </SubscriptionContext.Provider>
    </DispatchContext.Provider>
  );
}

export default ResiftProvider;
