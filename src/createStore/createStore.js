import { createStore as createReduxStore, combineReducers, applyMiddleware, compose } from 'redux';
import dataServiceReducer from '../dataServiceReducer';

function createStore(dataService) {
  const reducer = combineReducers({ dataService: dataServiceReducer });
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const enhancers = composeEnhancers(applyMiddleware(dataService));
  const store = createReduxStore(reducer, enhancers);

  return store;
}

export default createStore;
