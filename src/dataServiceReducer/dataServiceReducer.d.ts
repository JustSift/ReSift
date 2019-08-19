import _get from 'lodash/get';
import { combineReducers, Reducer } from 'redux';
import actions, { ActionsState } from './actionsReducer';
import shared, { SharedState } from './sharedReducer';

export type DataServiceState = { shared: SharedState; actions: ActionsState };

declare const dataServiceReducer: Reducer<DataServiceState>;

export default dataServiceReducer;
