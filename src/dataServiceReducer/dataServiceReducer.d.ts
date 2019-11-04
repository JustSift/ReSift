import { combineReducers, Reducer } from 'redux';
import actions, { ActionsState } from './actionsReducer';
import shared, { SharedState } from './sharedReducer';

export type DataServiceState = { shared: SharedState; actions: ActionsState };

/**
 * @docs `dataServiceReducer`
 *
 * > **Note:** Note: This API is a lower level API for usage with Redux. You should only need to
 * import this reducer if you're configuring Redux yourself.
 *
 * [See Usage with Redux for more info.](../guides/usage-with-redux.md)
 */
declare const dataServiceReducer: Reducer<DataServiceState>;

export default dataServiceReducer;
