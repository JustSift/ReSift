import React, { useContext, useMemo } from 'react';
import { ReactReduxContext, Provider } from 'react-redux';

import { createStore as createReduxStore, combineReducers, applyMiddleware, compose } from 'redux';
import dataServiceReducer from '../dataServiceReducer';

/**
 * used to create the store if the store isn't passed down from redux context
 */
function createStore(dataService) {
  const reducer = combineReducers({ dataService: dataServiceReducer });
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const enhancers = composeEnhancers(applyMiddleware(dataService));
  const store = createReduxStore(reducer, enhancers);

  return store;
}

function ResiftProvider({ children, dataService, suppressOutsideReduxWarning }) {
  const sawReduxContext = !!useContext(ReactReduxContext);

  if (process.env.NODE_ENV !== 'production') {
    if (sawReduxContext && !suppressOutsideReduxWarning) {
      console.warn(
        "[ResiftProvider] Saw an outside Redux context in this tree. If you're using Redux in your application, you don't need to wrap your app in the ResiftProvider. See https://resift.org/docs/guides/usage-with-redux",
      );
    }
  }

  if (!dataService) {
    throw new Error('[ResiftProvider] `dataService` missing from props.');
  }

  const store = useMemo(() => {
    return createStore(dataService);
  }, [dataService]);

  return <Provider store={store}>{children}</Provider>;
}

export default ResiftProvider;
