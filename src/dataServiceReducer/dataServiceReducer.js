import { combineReducers } from 'redux';
import actions from './actionsReducer';
import shared from './sharedReducer';

const dataServiceReducer = combineReducers({ shared, actions });

export default dataServiceReducer;
