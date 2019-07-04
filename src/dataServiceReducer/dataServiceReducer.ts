import _get from 'lodash/get';
import { combineReducers } from 'redux';
import actions from './actionsReducer';
import shared from './sharedReducer';

const dataServiceReducer = combineReducers({ shared, actions });

export type DataServiceState = ReturnType<typeof dataServiceReducer>;

export default dataServiceReducer;
