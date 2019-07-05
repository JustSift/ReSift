import _get from 'lodash/get';
import { combineReducers } from 'redux';
import actions from './actionsReducer';
import shared from './sharedReducer';

export default combineReducers({ shared, actions });
